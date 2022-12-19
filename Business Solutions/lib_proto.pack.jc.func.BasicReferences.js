/**
 * Utilité:
 *   Crée une référence au document au chemin choisi.
 *   Utilise le format suivant: `dossier>sous-dossier¶dossier>sous-dossier`
 *   Pour pouvoir entrer des références facilement, créer des mots clés pour les champs souhaités avec le format suivant:
 *       Affaire>
 *           Edelweiss
 *       Dossiers>
 *           Brasserie
 *           Animaux>
 *               Chiens
 * 
 * Configuration:
 *   "BasicReferences": {
 *       "refs": [
 *           {
 *               "field": "REFS"
 *           },
 *           {
 *               "field": "REFS_ADD"
 *           },
 *       ]
 *   }
 * 
 * Configuration optionnelle:
 *  *   "BasicReferences": {
 *       "refs": [
 *           {
 *               "field": "REFS",
 *               "basePath": "¶Espace de travail¶Références¶",
 *               "pathSeparator": ">",
 *               "referenceSeparator": "¶",
 *               "folderMask": 0
 *           },
 *           {
 *               "field": "REFS_ADD",
 *               "basePath": "¶Espace de travail¶Références additionnelle¶",
 *               "pathSeparator": "/",
 *               "referenceSeparator": "¶",
 *               "folderMask": 0
 *           },
 *       ]
 *   }
 */
 
 /**
 * Description in English
 * This utils generates references to current file
 * You can create any presets for each field adding elements in "refs" in the .config
 * Each element should contains "field" value in .conifg
 * Use this fields to input the path for creating the reference
 * You can also add default path start using "basePath" in the .config. In this case the final path will be a sum of basePath and inputed path
 * To split different folders in the path, use path separator which can be selected in "pathSeparator" in the config.
 * For isntance if you input next value: "Folder A > Folder B", and separator is ">" there will be Folder A generated and Folder B generated inside folder A, and the refernce generated inside Folder B
 * Use "referenceSeparator" in the .config to change default reference separator
 * Use "folderMask" in the .config to change the target folder mask
 *
 * Configuration examples:
 *
 * "BasicReferences": {
 *       "refs": [
 *           {
 *               "field": "REFS",
 *               "basePath": "¶Espace de travail¶Références¶",
 *               "pathSeparator": ">",
 *               "referenceSeparator": "¶",
 *               "folderMask": 0
 *           },
 *           {
 *               "field": "REFS_ADD",
 *               "basePath": "¶Espace de travail¶Références additionnelle¶",
 *               "pathSeparator": "/",
 *               "referenceSeparator": "¶",
 *               "folderMask": 0
 *           },
 *       ]
 *   }
 */






//@include lib_Class
//@include lib_sol.common.ObjectUtils
//@include lib_sol.common.DateUtils
//@include lib_sol.common.WfUtils
//@include lib_proto.pack.jc.PackFunction

sol.define("BasicReferences", {
    extend: "proto.pack.jc.PackFunction",

	// Class initialize event
    initialize(config) {
		// Read config and check for correct input fields

        this.refs = config.refs
        this.refs.forEach(ref => {
            ref.fields = config.field
            ref.basePath = ref.basePath || config.basePath || "¶"
            ref.pathSeparator = ref.pathSeparator || config.pathSeparator || ">"
            ref.referenceSeparator = ref.referenceSeparator || config.referenceSeparator || "¶"
            ref.folderMask = ref.folderMask || config.folderMask || 1
        });
		
			// Read debug config
		this.debug = shouldWriteLogsGlobal // Take global value
		
		// The local config is more powerful than global
		if(config.shouldWriteLogs === false){
			this.debug = false
		}
		
		if(config.shouldWriteLogs === true){
			this.debug = true
		}
		
		 log.info("BasicReferences.Debug: " + this.debug)
    },
	
	// Event called on indexDialog init
	onInit(indexDialogAdapter){
	// Run throw all references and check for correct
		var flag = false
		var fields = Array()	
	
        this.refs.forEach(ref => {	
				try{
					var value = indexDialogAdapter.getObjKeyValue(ref.field)
					 printDebugLog("BasicReferences.onInit: Field " + ref.field + " exists",this.debug)
				}
				catch(e){
					 fields.push(ref.field)
					 printDebugLog("BasicReferences.onInit: " + e,this.debug)
					 flag = true
				}        
            });
		
		// Check has at least one wrong field
		if(flag){
			// Creates warning 
			showDebugBox("BasicReferences", "Warning: Next input fields don't exist: " + fields,this.debug);
		}
	},
	
	// Event onFinish indexDialog
    onFinish(indexDialogAdapter, id) {
		printDebugLog("BasicReferences.onFinish",this.debug)
        this.createReferences(indexDialogAdapter, id)
    },

	// Function creates references to the file
    createReferences(indexDialogAdapter, id) {
		printDebugLog("BasicReferences.createReferences",this.debug)
        this.refs.forEach(refConf => {
			try{
			// Try to get value from field if it exists
            var fieldText = indexDialogAdapter.getObjKeyValue(refConf.field)
			printDebugLog("BasicReferences.createReferences. " + refConf.field + ": " + fieldText,this.debug)
			// Check if value exists
            if (fieldText) {
				// Split value using refefrence separator
                var splitFieldsContents = String(fieldText).split(refConf.referenceSeparator)
				// Run throw all splited parts
                splitFieldsContents.forEach(reference => {
					// Check if reference exists
                    if (reference) {
                        var pathEnd = reference.split(refConf.pathSeparator).join(String(refConf.basePath).charAt(0)) // Separate path parts with the first character of the base path. Elo uses the first character of a path as separation between folders in a path.
                        var newParent = archive.getElement(archive.getElementByArcpath("").addPath(refConf.basePath + pathEnd, refConf.folderMask)) // Creating target directory by path

                        archive.getElement(id).referenceIn(newParent) // Creating a refenrece in target directory

						var sord = sol.common.RepoUtils.getSord(id) // Getting sord of current file
						var currentDesc = sord.desc // Getting sord description
						var newDate = new Date() // Getting curremt date
						var today = ("0" + newDate.getDate()).slice(-2) + "/" + ("0" + (newDate.getMonth() + 1)).slice(-2) + "/" + String(newDate.getFullYear()) // Creating date text from date
						if(currentDesc != "") {
							currentDesc += "\n"
						}
                        currentDesc += "Une réference au document à été créée le " + today + " à l'emplacement " + refConf.basePath + pathEnd // Creating the description
						sord.setDesc(currentDesc) // Settings description to the current sord
						//indexDialogAdapter.setSord(sord) // Saving the sord
                    }
                });

                indexDialogAdapter.setObjKeyValue(refConf.field, "") // Clear the value in the ref field
            }
			}catch(e)
			{
				 printDebugLog("BasicReferences.createReferences: " + e,this.debug)
			}});
    }
})