package com.app.rcrfinance

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.net.http.SslError
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data = result.data
            val results: Array<Uri>? = when {
                data?.dataString != null -> arrayOf(Uri.parse(data.dataString))
                data?.clipData != null -> {
                    val count = data.clipData!!.itemCount
                    Array(count) { i -> data.clipData!!.getItemAt(i).uri }
                }
                else -> null
            }
            filePathCallback?.onReceiveValue(results)
        } else {
            filePathCallback?.onReceiveValue(null)
        }
        filePathCallback = null
    }

    private val TARGET_URL = "https://rcrfinance.com/"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Enable Chrome remote inspection for debugging
        WebView.setWebContentsDebuggingEnabled(true)

        // Setup layout programmatically for clean WebView container
        val layout = android.widget.RelativeLayout(this)
        webView = WebView(this)
        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            max = 100
            visibility = View.GONE
        }

        layout.addView(webView, android.widget.RelativeLayout.LayoutParams.MATCH_PARENT, android.widget.RelativeLayout.LayoutParams.MATCH_PARENT)
        val progressParams = android.widget.RelativeLayout.LayoutParams(
            android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
            8
        ).apply {
            addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP)
        }
        layout.addView(progressBar, progressParams)

        setContentView(layout)

        // Configure WebView settings
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            javaScriptCanOpenWindowsAutomatically = true
            setSupportMultipleWindows(false)
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            useWideViewPort = true
            loadWithOverviewMode = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT
            userAgentString = "${webView.settings.userAgentString} RCRFinanceApp/1.0.0"
        }

        // Expose native JavaScript bridge
        webView.addJavascriptInterface(WebAppInterface(this), "AndroidBridge")

        // Configure WebChromeClient for File/Camera upload picker, progress & console debugging
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                }
            }

            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                Log.d("RCRFinanceWeb", "[${consoleMessage?.messageLevel()}] ${consoleMessage?.message()} -- line ${consoleMessage?.lineNumber()}")
                return true
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*", "application/pdf"))
                }

                try {
                    fileChooserLauncher.launch(intent)
                } catch (e: Exception) {
                    this@MainActivity.filePathCallback = null
                    Toast.makeText(this@MainActivity, "Cannot open file picker", Toast.LENGTH_SHORT).show()
                    return false
                }
                return true
            }
        }

        // Configure WebViewClient for seamless in-app navigation
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                
                // Allow internal web navigation within our domain, payment gateway, or relative paths
                if (url.contains("rcrfinance.com") || 
                    url.contains("rcrgroups.shop") || 
                    url.contains("cashfree.com") || 
                    url.contains("cashfreepayments.com") || 
                    url.contains("hostingersite.com") || 
                    url.startsWith("http://localhost") || 
                    url.startsWith("blob:") || 
                    url.startsWith("data:")) {
                    return false
                }

                // Handle Android intent:// URIs (Cashfree / UPI intent standard)
                if (url.startsWith("intent:")) {
                    try {
                        val intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                        if (intent != null) {
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            val pm = packageManager
                            if (intent.resolveActivity(pm) != null) {
                                startActivity(intent)
                                return true
                            }
                            // Try browser fallback URL if app is not installed
                            val fallbackUrl = intent.getStringExtra("browser_fallback_url")
                            if (!fallbackUrl.isNullOrEmpty()) {
                                view?.loadUrl(fallbackUrl)
                                return true
                            }
                            // Try data URI fallback (e.g. raw upi://)
                            intent.data?.let { dataUri ->
                                val fallbackIntent = Intent(Intent.ACTION_VIEW, dataUri).apply {
                                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                }
                                startActivity(fallbackIntent)
                                return true
                            }
                        }
                    } catch (e: Exception) {
                        Log.e("RCRFinanceWeb", "Failed to parse intent URL: $url", e)
                    }
                }

                // Handle external custom intent schemes (UPI, PhonePe, Paytm, Google Pay, BHIM, Cred, Tel, Mailto, WhatsApp)
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("upi:") || 
                    url.startsWith("phonepe:") || url.startsWith("tez:") || url.startsWith("paytmmp:") || 
                    url.startsWith("bhim:") || url.startsWith("credpay:") || url.startsWith("whatsapp:")) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        startActivity(intent)
                        return true
                    } catch (e: Exception) {
                        if (url.startsWith("phonepe:") || url.startsWith("tez:") || url.startsWith("paytmmp:")) {
                            try {
                                val cleanQuery = Uri.parse(url).query ?: ""
                                val upiFallback = Intent(Intent.ACTION_VIEW, Uri.parse("upi://pay?$cleanQuery"))
                                upiFallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                startActivity(Intent.createChooser(upiFallback, "Complete Payment"))
                                return true
                            } catch (ex: Exception) {
                                // fallback ignored
                            }
                        }
                        Toast.makeText(this@MainActivity, "Payment app not found.", Toast.LENGTH_SHORT).show()
                        return true
                    }
                }

                // External web links (e.g. RBI portal or external docs)
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                    return true
                } catch (e: Exception) {
                    return false
                }
            }

            override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
                // Prevent SSL warnings from aborting webview render on older Android SSL cert chains
                Log.w("RCRFinanceWeb", "SSL Certificate warning bypassed: ${error?.toString()}")
                // Comply with Google Play Developer Security Policies
                Log.e("RCRFinanceWeb", "SSL error: " + error.toString())
                handler?.cancel()
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                if (request?.isForMainFrame == true) {
                    val html = """
                        <html>
                        <head><meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: -apple-system, sans-serif; text-align: center; padding: 40px 20px; background: #0f172a; color: #f8fafc; }
                            .card { background: #1e293b; padding: 30px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
                            button { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; margin-top: 20px; cursor: pointer; }
                        </style>
                        </head>
                        <body>
                            <div class="card">
                                <h2>Connection Error</h2>
                                <p>Unable to connect to the loan platform. Please check your internet connection.</p>
                                <button onclick="window.location.reload()">Retry Connection</button>
                            </div>
                        </body>
                        </html>
                    """.trimIndent()
                    view?.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
                }
            }
        }

        // Load the live deployed customer application
        webView.loadUrl(TARGET_URL)
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }
}