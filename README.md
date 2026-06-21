# Sub Sync

A desktop application built with Electron and React that helps you automatically organize and rename subtitle files to match your video files perfectly.

## 🚀 Download & Installation

**[Download the Windows Installer (.exe)](https://github.com/Sandika-2003/Sub-Sync/releases/latest)**

*Click the link above to go to the releases page, then click on `Sub Sync Setup 0.0.1.exe` under the "Assets" dropdown to download it.*

## 📖 How to Use

1. **Open the App:** Launch Sub Sync after installing.
2. **Select Folder:** Click the "Select Folder" button at the top. Choose the folder on your computer that contains both your video files (e.g., `.mp4`, `.mkv`) and your subtitle files (e.g., `.srt`, `.ass`).
3. **Review Pairings:** The app will automatically scan the folder and display all your videos on the left and all your subtitles on the right. 
   - **Important:** You can **drag and drop** the subtitle items up and down in the list to ensure they align perfectly across from their corresponding video file.
4. **Rename Subtitles:** Once the videos and subtitles are aligned properly side-by-side, click the big **RENAME SUBTITLES** button at the bottom.
5. **Done!** The app will rename all the subtitle files to match their paired video files exactly. Your media player will now automatically detect the subtitles when you play the videos!

## 🛠️ Development

If you'd like to build the project from source:

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev` to start the development server
4. Run `npm run build` followed by `npm run package:win` to build the `.exe` installer.
