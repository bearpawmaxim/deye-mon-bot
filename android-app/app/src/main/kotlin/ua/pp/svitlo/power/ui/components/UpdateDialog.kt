package ua.pp.svitlo.power.ui.components

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import ua.pp.svitlo.power.update.UpdateManager

@Composable
fun UpdateDialog(
    currentVersion: String,
    latestVersion: String,
    updateUrl: String,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Update Available",
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Text(
                text = "A new version of the app is available!\n\n" +
                        "Current version: $currentVersion\n" +
                        "New version: $latestVersion\n\n" +
                        "It is recommended to update the app to get new features and fixes."
            )
        },
        confirmButton = {
            TextButton(
                onClick = {
                    UpdateManager.downloadAndInstallUpdate(context, updateUrl)
                    onDismiss()
                }
            ) {
                Text("Update")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Later")
            }
        }
    )
}

