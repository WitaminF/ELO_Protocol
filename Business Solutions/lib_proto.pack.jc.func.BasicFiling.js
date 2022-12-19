/**
 * Utilité:
 *   Insère ou déplace le document en suivant le format donné.
 *   Le format peut contenir des champs pour utiliser leur valeurs dans le chemin de classement.
 *   Il peut aussi utiliser des valeurs spéciales comme:
 *       {#DATE}  pour  2021-12-31
 *       {#YEAR}  pour  2021
 *       {#MONTH}  pour  21
 *       {#DAY}  pour  31
 *   Il peut auddi utiliser des fonctions spéciales comme:
 *       {#FIRST(NAME)}
 *   Le format commence par un caractère qui sera utilisé comme séparateur du chemin. Un autre caractère que ¶ peut être utilisé si voulu.
 *   Voilà quelques exemples de formats:
 *       ¶Plan de classement¶{CLASSEMENT}¶{#YEAR}¶
 *       /Factures/{CORRESPONDANT}/{#YEAR}/{#MONTH}/
 *       ¶Factures¶{CORRESPONDANT}¶{#YEAR}¶{#MONTH}¶
 * 
 * Configuration:
 *   "BasicFiling": {
 *       "format": "Espace de classement¶{CLASSEMENT}¶{#YEAR}¶{#MONTH}"
 *   }
 * 
 * Configuration optionnelle:
 *   "BasicFiling": {
 *       "format": "Espace de classement¶{CLASSEMENT}¶",
 *       "folderMask": 0,
 *       "subfolderField": "CLASSEMENT_SPECIAL",
 *       "subfolderDefaultFormat": "{#YEAR}¶{#MONTH}"
 *   }
 */
 
 /**
 * Description in English
 * This util moves the file into special directory which is set in .config file in "format"
 * Use ¶ to sepate folders in the file path
 * You can use values in the file path from fields using this expression {FIELD_NAME}
 * Also you can use special values like {#DATE}, {#YEAR}, {#FISRT(NAME)} etc.
 * You can generate subfolder with format inputed in special field. The field set in .config "subfolderField"
 * Also you can add default subfolder path, for cases when subfolderField will be empty. In .config "subfolderDefaultFormat"
 * You can choose the mask of destination folder using .config "folderMask". Default mask is 0
 *
 * Configuration examples:
 *
 *   "BasicFiling": {
 *       "format": "Espace de classement¶{CLASSEMENT}¶{#YEAR}¶{#MONTH}"
 *   }
 * 
 *   "BasicFiling": {
 *       "format": "Espace de classement¶{CLASSEMENT}¶",
 *       "folderMask": 0,
 *       "subfolderField": "CLASSEMENT_SPECIAL",
 *       "subfolderDefaultFormat": "{#YEAR}¶{#MONTH}"
 *   }
 */






//@include lib_Class
//@include lib_sol.common.ObjectUtils
//@include lib_proto.pack.jc.PackFunction
//@include lib_proto.pack.jc.utils.PathFormat

sol.define("BasicFiling", {
    extend: "proto.pack.jc.PackFunction",

	// Class initialize event
    initialize(config) {
		
		// Check was .config inputed correctly
        if (!sol.common.ObjectUtils.isObject(config)) throw "BasicFiling error: config must be an object"
        if (!sol.common.ObjectUtils.isString(config.format)) throw "BasicFiling error: config must be a string"

		// Read values from config on initialize
        this.format = config.format
        this.folderMask = config.folderMask || "0" // If mask is empty use 0 as default mask
        this.subfolderField = config.subfolderField || ""
        this.subfolderDefaultFormat = config.subfolderDefaultFormat || ""
		
			// Read debug config
		this.debug = shouldWriteLogsGlobal // Take global value
		
		// The local config is more powerful than global
		if(config.shouldWriteLogs == false){
			this.debug = false
		}
		
		if(config.shouldWriteLogs == true){ 
			this.debug = true
		}
		
		 log.info("BasicFiling.Debug: " + this.debug)
    },


	// Event on indexDialog insert
    onInsert(indexDialogAdapter, insertFunction) {
		printDebugLog("BasicFiling.onInsert",this.debug)
		// Get id of the parent folder in the target destination
        var parentId = this.getNewParentId(indexDialogAdapter)
		// ???
        insertFunction(parentId, "1", "")
    },
	
	// Event on indexDialog finish
    onFinish(indexDialogAdapter, id) {
		printDebugLog("BasicFiling.onFinish",this.debug)
		// Get id of the parent folder in the target destination
        var parentId = this.getNewParentId(indexDialogAdapter)
		// Move current file into destination folder
        archive.getElement(id).moveToFolder(archive.getElement(parentId), false)
    },

	// Method creates a target destination if it doesn't exist and returns parents (target folder) id
    getNewParentId(archiveDocument) {
		printDebugLog("BasicFiling.getNewParentId",this.debug)
		// Parsing path from .config file
        var path = proto.pack.jc.utils.PathFormat.parseFormat(archiveDocument, this.format)
		
		// Creating path folders with selected folder mask
        var parentId = archive.getElementByArcpath("").addPath(path, this.folderMask)

		// Check should create subfolder and does have a parent
        if (this.subfolderField != "" && parentId) {
            var subFormat;
			// Try to read subFormat from subFolderField
            try { subFormat = archive.getElement(parentId).getObjKeyValue(this.subfolderField) } catch (e) { subFormat = "" }
            
			// If subFormat is empty, read it from .config value subfolderDefaultFormat
			if (subFormat == "") subFormat = this.subfolderDefaultFormat


			// Check do we have subFormat
            if (subFormat) {
				printDebugLog("BasicFiling.processSubFolder",this.debug)
				// Parse subFolder path
                let subPath = proto.pack.jc.utils.PathFormat.parseFormat(archiveDocument, subFormat)
				// Creating subfolder and saving it ids
                parentId = archive.getElementByArcpath("").addPath(path + subPath, this.folderMask)
            }
        }
	
		// Returns destination id
        return parentId
    },
})