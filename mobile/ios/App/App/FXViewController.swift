import Capacitor
import WebKit

/// Injects the Prettier Fantrax bundle (`injected.js`) into the remote
/// fantrax.com page loaded in the Capacitor WebView.
///
/// Implementation notes:
///
/// - `capacitorDidLoad()` is the right hook here: looking at
///   `CAPBridgeViewController.loadView()`, the WebView (and its
///   `WKWebViewConfiguration.userContentController`) is fully constructed and
///   assigned to `webView`/`bridge` *before* `capacitorDidLoad()` runs, and the
///   actual page load (`loadWebView()`) is only triggered later, from
///   `viewDidLoad()`. In other words `capacitorDidLoad()` fires strictly
///   before the first navigation starts, so registering our `WKUserScript`
///   here is not racing the initial page load - it will be present for it.
///
/// - `CAPBridgeProtocol.injectScriptBeforeLoad(path:)` looks like the
///   "official" API for this, but it's a no-op by the time
///   `capacitorDidLoad()` is called: `CapacitorBridge.init` sets
///   `canInjectJS = false` right after exporting its own misc JS, and that
///   `init` completes (and `capacitorDidLoad()` is invoked) before this
///   subclass ever gets a chance to call it. So we add the `WKUserScript`
///   directly to the content controller instead.
///
/// - A `WKUserScript` added to the `WKUserContentController` is re-injected
///   on every subsequent navigation/document load of that WebView
///   automatically (that's how `.atDocumentEnd` user scripts work), so a
///   single registration here covers "every page/document load", not just
///   the first one. Because of that - and because registration happens
///   before the first navigation, per the timing note above - a separate
///   `WKNavigationDelegate`-based fallback (e.g. re-evaluating the script on
///   `didFinish`) isn't necessary; `injected.js` already guards itself with
///   `window.__FX_INJECTED` (see below) so it would be harmless to add one,
///   but Capacitor's `WebViewDelegationHandler` already owns
///   `webView.navigationDelegate` and doesn't expose a supported way to
///   observe/chain into it from here without fighting the framework.
class FXViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        injectFantraxRefinementsScript()
    }

    private func injectFantraxRefinementsScript() {
        guard let userContentController = bridge?.webView?.configuration.userContentController else {
            CAPLog.print("⚡️ ❌ FX: unable to access userContentController; injected.js will not run")
            return
        }

        guard let scriptURL = Bundle.main.url(forResource: "injected", withExtension: "js"),
              let bundleSource = try? String(contentsOf: scriptURL, encoding: .utf8) else {
            CAPLog.print("⚡️ ❌ FX: unable to load injected.js from the app bundle")
            return
        }

        // Guard against double-registration/double-execution: injected.js
        // internally guards its CSS via a #fx-styles element check, but
        // re-running the whole bundle a second time would double-register
        // its own listeners, so we also guard the injection itself here.
        let guardedSource = """
        if (!window.__FX_INJECTED) {
          window.__FX_INJECTED = true;
          \(bundleSource)
        }
        """

        let userScript = WKUserScript(
            source: guardedSource,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: true
        )
        userContentController.addUserScript(userScript)
    }
}
