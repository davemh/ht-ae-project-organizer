// ======================================================================================
// Script Name: HT AE Project Organizer v2.0.0
// Description: Automatically organizes project items into folders.
//              Rather than relying on user input, all sorting options here are hard-coded,
//              based on HT's standard AE project template.
// Author: Dave Hess (https://github.com/davemh)
// Forked from: Project Organizer by Aleksandr Zakharov (https://github.com/jakkimcfly)
// License: MIT
// ======================================================================================

(function projectOrganizerScript() {

    var SCRIPT_NAME = "HT AE Project Organizer";
    var SCRIPT_VERSION = "2.0.0";

    // -------------------------------------------------------------------
    // FILE EXTENSION HELPERS
    // -------------------------------------------------------------------

    function hasExtension(file, extensions) {

        var fileName = file.name.toLowerCase();
        var extensionsArray = extensions.toLowerCase().split(",");

        for (var i = 0; i < extensionsArray.length; i++) {

            var extension = extensionsArray[i].replace(/\s+/g, "");

            if (fileName.match(new RegExp("\\." + extension + "$"))) {
                return true;
            }
        }

        return false;
    }

    // -------------------------------------------------------------------
    // IMAGE SEQUENCE DETECTION
    // -------------------------------------------------------------------

    function detectImageSequences(imageItems) {

        var sequences = [];
        var processedItems = {};

        for (var i = 0; i < imageItems.length; i++) {

            var item = imageItems[i];

            if (processedItems[item.name]) {
                continue;
            }

            var match = item.name.match(/^(.+?)_?(\d{2,})(?:\.\w+)?$/);

            if (!match) {
                continue;
            }

            var base = match[1];
            var currentNum = parseInt(match[2], 10);

            var sequence = [item];

            processedItems[item.name] = true;

            var nextNum = currentNum + 1;
            var found = true;

            while (found) {

                found = false;

                for (var j = 0; j < imageItems.length; j++) {

                    var nextItem = imageItems[j];

                    if (processedItems[nextItem.name]) {
                        continue;
                    }

                    var nextMatch = nextItem.name.match(
                        /^(.+?)_?(\d{2,})(?:\.\w+)?$/
                    );

                    if (
                        nextMatch &&
                        nextMatch[1] === base &&
                        parseInt(nextMatch[2], 10) === nextNum
                    ) {

                        sequence.push(nextItem);

                        processedItems[nextItem.name] = true;

                        nextNum++;
                        found = true;

                        break;
                    }
                }
            }

            // Only count as a sequence if 3+ files

            if (sequence.length >= 3) {

                sequences.push(sequence);

            } else {

                for (var k = 0; k < sequence.length; k++) {
                    delete processedItems[sequence[k].name];
                }
            }
        }

        return sequences;
    }

    // -------------------------------------------------------------------
    // PRECOMP DETECTION
    // -------------------------------------------------------------------

    function isPrecomp(comp) {

        for (var i = 1; i <= app.project.numItems; i++) {

            var item = app.project.item(i);

            if (
                item instanceof CompItem &&
                item !== comp
            ) {

                for (var j = 1; j <= item.numLayers; j++) {

                    var layer = item.layer(j);

                    if (layer.source === comp) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // -------------------------------------------------------------------
    // UI
    // -------------------------------------------------------------------

    function createUI(thisObj) {

        var win = (thisObj instanceof Panel)
            ? thisObj
            : new Window(
                "palette",
                SCRIPT_NAME + " " + SCRIPT_VERSION,
                undefined
            );

        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 10;
        win.margins = 16;

        // ---------------------------------------------------------------
        // HEADER
        // ---------------------------------------------------------------

        var header = win.add("group");

        header.orientation = "column";
        header.alignChildren = "center";

        header.add(
            "statictext",
            undefined,
            SCRIPT_NAME + " " + SCRIPT_VERSION
        );

        var desc = header.add(
            "statictext",
            undefined,
            "Organizes project items into the standard folder structure.",
            { multiline: true }
        );

        desc.justify = "center";

        // ---------------------------------------------------------------
        // FOLDER STRUCTURE PREVIEW
        // ---------------------------------------------------------------

        var treePanel = win.add(
            "panel",
            undefined,
            "Folder Structure"
        );

        treePanel.alignChildren = ["left", "top"];
        treePanel.margins = 12;

        var treeText =
            "_Organized\n" +
            "├─ 01. Assets\n" +
            "│  ├─ 00. Solids\n" +
            "│  ├─ 01. Images\n" +
            "│  │  └─ seq01, seq02, etc.\n" +
            "│  ├─ 02. Graphics\n" +
            "│  ├─ 03. Videos\n" +
            "│  ├─ 04. Audio\n" +
            "│  └─ Other\n" +
            "└─ 02. Comps\n" +
            "   ├─ 01. Precomps\n" +
            "   └─ 02. Render Comps";

        treePanel.add(
            "statictext",
            undefined,
            treeText,
            { multiline: true }
        );

        // ---------------------------------------------------------------
        // EXCLUSION SETTINGS
        // ---------------------------------------------------------------

        var exclusionPanel = win.add(
            "panel",
            undefined,
            "Exclude Items"
        );

        exclusionPanel.orientation = "column";
        exclusionPanel.alignChildren = ["left", "top"];
        exclusionPanel.margins = 12;

        var radioGroup = exclusionPanel.add("group");

        radioGroup.orientation = "row";

        var filterByName = radioGroup.add(
            "radiobutton",
            undefined,
            "Exclude by name"
        );

        var filterByComment = radioGroup.add(
            "radiobutton",
            undefined,
            "Exclude by comment"
        );

        filterByName.value = true;

        var exclusionInput = exclusionPanel.add(
            "edittext",
            undefined,
            ""
        );

        exclusionInput.characters = 30;

        // ---------------------------------------------------------------
        // BUTTONS
        // ---------------------------------------------------------------

        var buttonGroup = win.add("group");

        buttonGroup.alignment = "center";

        var organizeButton = buttonGroup.add(
            "button",
            undefined,
            "Organize Project"
        );

        // ---------------------------------------------------------------
        // ORGANIZE BUTTON
        // ---------------------------------------------------------------

        organizeButton.onClick = function () {

            app.beginUndoGroup("Organize Project Items");

            try {

                var exclusionText =
                    exclusionInput.text.toLowerCase();

                // -------------------------------------------------------
                // CREATE ROOT FOLDERS
                // -------------------------------------------------------

                var organizedFolder =
                    app.project.items.addFolder("_Organized");

                var assetsFolder =
                    app.project.items.addFolder("01. Assets");

                assetsFolder.parentFolder = organizedFolder;

                var compsFolder =
                    app.project.items.addFolder("02. Comps");

                compsFolder.parentFolder = organizedFolder;

                // -------------------------------------------------------
                // ASSETS SUBFOLDERS
                // -------------------------------------------------------

                var solidsFolder =
                    app.project.items.addFolder("00. Solids");

                solidsFolder.parentFolder = assetsFolder;

                var imagesFolder =
                    app.project.items.addFolder("01. Images");

                imagesFolder.parentFolder = assetsFolder;

                var graphicsFolder =
                    app.project.items.addFolder("02. Graphics");

                graphicsFolder.parentFolder = assetsFolder;

                var videosFolder =
                    app.project.items.addFolder("03. Videos");

                videosFolder.parentFolder = assetsFolder;

                var audioFolder =
                    app.project.items.addFolder("04. Audio");

                audioFolder.parentFolder = assetsFolder;

                var otherFolder =
                    app.project.items.addFolder("Other");

                otherFolder.parentFolder = assetsFolder;

                // -------------------------------------------------------
                // COMPS SUBFOLDERS
                // -------------------------------------------------------

                var precompsFolder =
                    app.project.items.addFolder("01. Precomps");

                precompsFolder.parentFolder = compsFolder;

                var renderCompsFolder =
                    app.project.items.addFolder("02. Render Comps");

                renderCompsFolder.parentFolder = compsFolder;

                // -------------------------------------------------------
                // COLLECT PROJECT ITEMS
                // -------------------------------------------------------

                var projectItems = [];

                for (
                    var i = 1;
                    i <= app.project.numItems;
                    i++
                ) {

                    var item = app.project.item(i);

                    if (item instanceof FolderItem) {
                        continue;
                    }

                    var itemName =
                        item.name.toLowerCase();

                    var itemComment =
                        item.comment
                            ? item.comment.toLowerCase()
                            : "";

                    var exclude = false;

                    if (exclusionText !== "") {

                        if (filterByName.value) {

                            exclude =
                                itemName.indexOf(exclusionText) !== -1;

                        } else {

                            exclude =
                                itemComment.indexOf(exclusionText) !== -1;
                        }
                    }

                    if (!exclude) {
                        projectItems.push(item);
                    }
                }

                // -------------------------------------------------------
                // DETECT IMAGE SEQUENCES
                // -------------------------------------------------------

                var imageItems = [];

                for (i = 0; i < projectItems.length; i++) {

                    item = projectItems[i];

                    if (
                        item instanceof FootageItem &&
                        item.file &&
                        hasExtension(
                            item.file,
                            "jpg,jpeg,png,tif,tiff,bmp,gif,exr"
                        )
                    ) {

                        imageItems.push(item);
                    }
                }

                var sequences =
                    detectImageSequences(imageItems);

                var sequencedItems = {};

                for (var s = 0; s < sequences.length; s++) {

                    for (
                        var si = 0;
                        si < sequences[s].length;
                        si++
                    ) {

                        sequencedItems[
                            sequences[s][si].name
                        ] = s;
                    }
                }

                // -------------------------------------------------------
                // CREATE SEQUENCE FOLDERS
                // -------------------------------------------------------

                var sequenceFolders = {};

                for (s = 0; s < sequences.length; s++) {

                    var seqName =
                        "seq" +
                        ("0" + (s + 1)).slice(-2);

                    sequenceFolders[s] =
                        app.project.items.addFolder(seqName);

                    sequenceFolders[s].parentFolder =
                        imagesFolder;
                }

                // -------------------------------------------------------
                // ORGANIZE ITEMS
                // -------------------------------------------------------

                for (i = 0; i < projectItems.length; i++) {

                    item = projectItems[i];

                    var moved = false;

                    // ---------------------------------------------------
                    // COMPOSITIONS
                    // ---------------------------------------------------

                    if (item instanceof CompItem) {

                        if (isPrecomp(item)) {

                            item.parentFolder =
                                precompsFolder;

                        } else {

                            item.parentFolder =
                                renderCompsFolder;
                        }

                        moved = true;
                    }

                    // ---------------------------------------------------
                    // FOOTAGE
                    // ---------------------------------------------------

                    else if (
                        item instanceof FootageItem
                    ) {

                        // Solids

                        if (
                            item.mainSource instanceof SolidSource
                        ) {

                            item.parentFolder =
                                solidsFolder;

                            moved = true;
                        }

                        // Files

                        else if (item.file) {

                            // Sequences

                            if (
                                sequencedItems[item.name] !==
                                undefined
                            ) {

                                item.parentFolder =
                                    sequenceFolders[
                                        sequencedItems[item.name]
                                    ];

                                moved = true;
                            }

                            // Graphics

                            else if (
                                hasExtension(
                                    item.file,
                                    "psd"
                                )
                            ) {

                                item.parentFolder =
                                    graphicsFolder;

                                moved = true;
                            }

                            // Images

                            else if (
                                hasExtension(
                                    item.file,
                                    "jpg,jpeg,png,tif,tiff,bmp,gif,exr"
                                )
                            ) {

                                item.parentFolder =
                                    imagesFolder;

                                moved = true;
                            }

                            // Videos

                            else if (
                                hasExtension(
                                    item.file,
                                    "mp4,mov,avi,mxf"
                                )
                            ) {

                                item.parentFolder =
                                    videosFolder;

                                moved = true;
                            }

                            // Audio

                            else if (
                                hasExtension(
                                    item.file,
                                    "wav,mp3,aif,aiff,m4a"
                                )
                            ) {

                                item.parentFolder =
                                    audioFolder;

                                moved = true;
                            }
                        }
                    }

                    // ---------------------------------------------------
                    // FALLBACK
                    // ---------------------------------------------------

                    if (!moved) {

                        item.parentFolder =
                            otherFolder;
                    }
                }

            } catch (err) {

                alert(
                    "Error organizing project:\n\n" +
                    err.toString()
                );
            }

            app.endUndoGroup();
        };

        win.layout.layout(true);

        return win;
    }

    // -------------------------------------------------------------------
    // INITIALIZE UI
    // -------------------------------------------------------------------

    var ui = createUI(this);

    if (ui instanceof Window) {

        ui.center();
        ui.show();
    }

})();
