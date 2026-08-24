package com.noahsemus.fantraxrefinements;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "FXInjection";
    private static final String ASSET_PATH = "injected.js";

    // Cached after the first successful read so we don't re-read the asset
    // on every page load.
    private String cachedInjectedJs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // BridgeActivity#onCreate() builds and assigns `this.bridge` (via its
        // internal call to load()) before returning, so it's safe to use it
        // here, immediately after super.onCreate().
        this.bridge.addWebViewListener(
            new WebViewListener() {
                @Override
                public void onPageLoaded(WebView webView) {
                    injectFantraxRefinementsScript(webView);
                }
            }
        );
    }

    private void injectFantraxRefinementsScript(final WebView webView) {
        final String script = getInjectedJs();
        if (script == null) {
            return;
        }

        // WebViewListener callbacks are already invoked on the UI thread,
        // but evaluate defensively via runOnUiThread to guarantee it.
        runOnUiThread(
            new Runnable() {
                @Override
                public void run() {
                    webView.evaluateJavascript(script, null);
                }
            }
        );
    }

    private String getInjectedJs() {
        if (cachedInjectedJs != null) {
            return cachedInjectedJs;
        }

        String bundleSource = readAsset(ASSET_PATH);
        if (bundleSource == null) {
            return null;
        }

        // Guard against double-registration/double-execution: injected.js
        // internally guards its CSS via a #fx-styles element check, but
        // re-running the whole bundle a second time would double-register
        // its own listeners, so we also guard the injection itself here.
        cachedInjectedJs = "if (!window.__FX_INJECTED) { window.__FX_INJECTED = true; " + bundleSource + " }";
        return cachedInjectedJs;
    }

    private String readAsset(String path) {
        StringBuilder builder = new StringBuilder();
        try (
            InputStream inputStream = getAssets().open(path);
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))
        ) {
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line).append('\n');
            }
        } catch (IOException e) {
            Log.e(TAG, "Unable to read " + path + " from assets", e);
            return null;
        }
        return builder.toString();
    }
}
