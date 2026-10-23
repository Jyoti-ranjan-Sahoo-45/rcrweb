package com.app.rcrfinance

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.webkit.JavascriptInterface
import android.widget.Toast
import org.json.JSONObject

class WebAppInterface(private val context: Context) {

    @JavascriptInterface
    fun getDeviceInfo(): String {
        val json = JSONObject()
        json.put("isNative", true)
        json.put("platform", "Android")
        json.put("manufacturer", Build.MANUFACTURER)
        json.put("model", Build.MODEL)
        json.put("osVersion", Build.VERSION.RELEASE)
        json.put("sdkInt", Build.VERSION.SDK_INT)
        json.put("appVersion", "1.0.0")
        return json.toString()
    }

    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun downloadFile(url: String, filename: String) {
        try {
            val request = DownloadManager.Request(Uri.parse(url)).apply {
                setTitle(filename)
                setDescription("Downloading document...")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
            }
            val dm = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)
            Toast.makeText(context, "Download started: $filename", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(context, "Download failed: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    @JavascriptInterface
    fun openUpiApp(packageName: String, upiUri: String): Boolean {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(upiUri))
            if (packageName.isNotEmpty()) {
                intent.setPackage(packageName)
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            return true
        } catch (e: Exception) {
            return try {
                val genericIntent = Intent(Intent.ACTION_VIEW, Uri.parse(upiUri))
                genericIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(Intent.createChooser(genericIntent, "Complete Payment"))
                true
            } catch (ex: Exception) {
                Toast.makeText(context, "UPI App not installed. Please pay manually to UPI ID.", Toast.LENGTH_LONG).show()
                false
            }
        }
    }
}
