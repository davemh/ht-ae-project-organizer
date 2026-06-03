![Project Organizer](./screenshot.jpg)
# 🎬 HT AE Project Organizer for After Effects

**HT AE Project Organizer** is a simple but powerful script for Adobe After Effects that automatically sorts project items into folders based on their type (Videos, Images, Audio, Compositions, Solids, and more).  It helps you keep your project tidy and structured with a single click.


## ⚡ Features

- Automatically create folders and sort Project panel items:
  - Videos (`.mp4`, `.mov`, `.avi`, etc.)
  - Images (`.jpg`, `.png`, `.gif`, etc.)
  - Audio (`.mp3`, `.wav`, etc.)
  - Image Sequences ('.jpg', '.png', '.tif', etc.)
  - Compositions
  - Solids
  - Other files
- Simple one-click operation

## 📦 Installation

1. Download the script file: `HT_AE_Project_Organizer_[version].jsx`
2. Use File > Install > Script, or move it into your After Effects `Scripts` folder:
   - **Windows:** `C:\Program Files\Adobe\Adobe After Effects\Support Files\Scripts\`
   - **macOS:** `/Applications/Adobe After Effects/Scripts/`
3. Launch After Effects
4. Go to `File > Scripts > Ht AE Project Organizer [version]`

> 💡 You can enable "Allow Scripts to Write Files and Access Network" in `Edit > Preferences > Scripting & Expressions`.

## 🚀 Usage

1. Open your After Effects project.
2. Run the script via `File > Scripts > HT AE ProjectOrganizer [version]`.
5. Click **Organize Project** – your project is now clean and organized!

## 📂 Example

**Before:**
```
Project
├── asset.psd
├── Null 1
├── Solid 1
├── image.jpg
├── Adjustment Layer 1
├── a-comp-with-no-parents
├── a-comp-with-parent
└── image-sequence[00-09].png
...etc.
```

**After:**
```
Project
_Organized
01. Assets
├── 00. Solids
│   └── Null 1
│   └── Solid 1
│   └── Adjustment Layer 1
├── 01. Images
│   └── image.jpg
├── 02. Graphics
│   └── asset.psd
├── 03. Seq
│   └── image-sequence[00-09].png
02. Comps
└── 01. Precomps
    └── a-comp-with-parent
    02. Render COmps
    └── a-comp-with-no-parents
    
```

## 🛠️ Development
This script is written in ExtendScript (JavaScript for Adobe apps).  
Feel free to contribute or fork this repository!

## 📃 License
This project is licensed under the [MIT License](LICENSE).
