//@include lib_Class
//@include lib_sol.common.Config
//@include lib_sol.common.ObjectUtils

//@include lib_proto.pack.jc.PackFunction
//@include lib_proto.pack.jc.ImportAllFunctions
//@include lib_proto.pack.jc.CustomFunctions


/**
 * La variable globale pour charger une configuration.
 * Lorsque l'on crée un script, après avoir importé le pack, entrer le chemin de la configuration.
 * ```
 * configPath = "/proto.pack/Configuration/my_pack.config"
 * `'`
 */
 
 /**
 * Description in English
 * This is a global script for loading configuration from the .congif file
 * Set path to the config file:  configPath = "/proto.pack/Configuration/my_pack.config"
 */
var configPath
var shouldWriteLogsGlobal = true

/**
 * La classe statique pour charger la configuration.
 */
sol.define("proto.pack.jc.Pack", {
    singleton: true,

    config: null,
    configObjects: [],
    asConfig: null,

    /**
     * Charge la configuration des masques ainsi que la configuration ELOas.
     */
	// Downloading the mask's and ELO'as configuration
    loadConfig() {
		log.info("Pack.loadConfig")
        var config = this.validateMaskConfig(this.getMaskConfig()) // Load config
        this.config = config // Set config global value 

		// Create an array for Config objects
        this.configObjects = []
		
        var asConfig = this.getASConfig() // Load AS config
        this.asConfig = asConfig // Set asConfig global value
    },

    /**
     * Utilise sol.common.Config pour charger la configuration.
     * @returns {Object} La configuration
     */
	// This function read the config from the config file by the config path
    getMaskConfig() {
        var config;
		log.info("Pack.getMaskConfig")
		// Check doest config path exist
        if (configPath) {
            config = sol.create("sol.common.Config", { compose: configPath }).config; // Read config form file
        }
        else {
            throw "Couldn't find the configuraiton."
        }

        return config;
    },
    /**
     * Utilise `sol.common.ObjectUtils` pour valider la configuration des masques.
     * Lance une exception s'il y a un problème avec la configuration.
     * @param {Object} conf La configuration 
     * @returns {Object} La configuration
     */
	 
	// This function check is the config for each mask correct
    validateMaskConfig(conf) {
		log.info("Pack.validateMaskConfig")
		
		// Check is .config correct
        if (!sol.common.ObjectUtils.isObject(conf))
            throw "Error validating the config, the config should be an object."
		
		// Run throw all masks in .config
        for (var key in conf) {
			// Check is config for each mask correct
			if(key != "shouldWriteLogsGlobal"){
            if (!sol.common.ObjectUtils.isObject(conf[key]))
			throw "Error validating the config, the mask  `" + key + "` should be an object."}else{
				shouldWriteLogsGlobal = conf[key]
			}
        }

        return conf
    },

    /**
     * Utilise sol.common.Config pour charger la configuration ELOas.
     * @returns {Object} La configuration
     */
	 
	// This function read the asConfig file by the path
    getASConfig() {
		log.info("Pack.getASConfig")
        var config;
		
		// Read the config file
        config = sol.create("sol.common.Config", { compose: "common/Configuration/as.config" }).config;

        return config;
    },

	// This function returns the document from intray of indexDialog
    getIntrayDocument(indexDialogAdapter) {
		log.info("Pack.getIntrayDocument")
        var intrayDocument = null
		
		// Get the file of indexDialog
        var file = indexDialogAdapter.getFile()
		
		// Get intray file list
        var fileList = intray.getDocuments()
		
		// Run throw file list
        while (fileList.hasMoreElements()) {
            var possibleFile = fileList.nextElement() // Read the file from list
			
			// If documents paths are simillar save it leave from loop
            if (String(possibleFile.getFilePath()) == String(file)) {
                intrayDocument = possibleFile
                break
            }
        }
		
		// Return intray document file
        return intrayDocument
    },

    /**
     * Crée les objets pour toutes les fonctionnalités.
     * Mets les variables temporaires à zéro et initialise la configuration.
     * Cette fonction est appelée lorsque l'utilisateur ouvre le dialogue d'indexation ou quand les scripts sont rechargés.
     * @param {String} onMaskName Le nom du masque 
     */
	 
	// This function creates script objects for mask from script
    createConfigObjects(onMaskName) {
		log.info("Pack.createConfigObjects")
        this.configObjects = []
        log.info("Pack.createConfigObjects.onMaskName : " + onMaskName)
        log.info("Pack.createConfigObjects.this.config : " + this.config)
		
		// Run throw all masks in the config
        for (var maskName in this.config) {
			// Check is mask name equal to our mask
            if (String(onMaskName) == maskName) {
				// If mask exists read his config
                var maskConfig = this.config[maskName]
				// Run throw all objects in maskConfig
                for (var funcName in maskConfig) {
					// Create a script object and push it into the objects array
                    var funcConfig = maskConfig[funcName]
                    this.configObjects.push(sol.create(funcName, funcConfig))
                }
            }
        }
    },
    /**
     * Appelle l'évènement voulu sur toutes les fonctionnalités dans `configObjects` pour le masque donné.
     * @param {String} eventName Le nom de l'évènement : onInit, onNameExit, onDateExit, onFieldExit, onInsert, onFinish
     * @param {Array} paramArray Une liste des paramètres à passer à la fonctionnalité.
     */
	// Calls selected event in all objects generated for current mask
    callEvent(eventName, paramArray) {
        log.info("Pack.callEvent : " + eventName)
        log.info("Pack.callEvent.configObjects : " + this.configObjects)
		// Run throw generated objects
        for (var i = 0; i < this.configObjects.length; i++) {
            var obj = this.configObjects[i]
            // Event might not be implemented
			// Check if object contains this event
            if (obj[eventName]) {
				// If event exists call it
                var ret = obj[eventName].apply(obj, paramArray)
                if (ret === false) {
                    // Return negative to cancel the event
                    return -1
                }
            }
        }
        return 1
    },
})


// La configuration est rechargée quand ELO est lancée ou quand les scripts sont rechargés.
// Event onEloWorkspaceStarted
function eloWorkspaceStarted() {
	 log.info("Pack.eloWorkspaceStarted")
	// Load config on start
    proto.pack.jc.Pack.loadConfig()
}


// The event called on reloading scripts
function eloScriptsReloaded() {
	log.info("Pack.eloScriptsReloaded")
    proto.pack.jc.Pack.loadConfig()
    log.info("Pack.eloScriptsReloaded.indexDialog : " + indexDialog.isVisible())
    if (indexDialog.isVisible()) {
        log.info("Pack.eloScriptsReloaded: In if eloScriptsReloaded")
        proto.pack.jc.Pack.createConfigObjects(indexDialog.getDocMaskName())
    }
}


// Lower is just an implementation of all events from global to specific

// Les évènements sont appelés dans les évènements d'ELO
// The event called on selection / opening doc mask
function eloIndexDialogSetDocMask(indexDialogAdapter) {
	log.info("Pack.eloIndexDialogSetDocMask")
    proto.pack.jc.Pack.createConfigObjects(indexDialogAdapter.getDocMaskName())
    return proto.pack.jc.Pack.callEvent("onInit", [indexDialogAdapter])
}

// The event called on leave focus from indexDialog name field
function eloIndexDialogNameExit(keywordingAdapter) {
	log.info("Pack.eloIndexDialogNameExit")
    return proto.pack.jc.Pack.callEvent("onNameExit", [keywordingAdapter])
}

// The event called on leave focus from indexDialog XDate
function eloIndexDialogXDateExit(keywordingAdapter) {
	log.info("Pack.eloIndexDialogXDateExit")
    return proto.pack.jc.Pack.callEvent("onDateExit", [keywordingAdapter])
}
// The event called on leave focus from index dialog input field
function eloIndexDialogObjKeyExit(fieldId, indexDialogAdapter) {
	log.info("Pack.eloIndexDialogObjKeyExit")
    var fieldName; try { fieldName = String(indexDialogAdapter.getDocMask().getLines()[fieldId].getKey()) } catch (e) { fieldName = null }
    log.info("fieldName ss: " + fieldName)
    if (fieldName)
        return proto.pack.jc.Pack.callEvent("onFieldExit", [indexDialogAdapter, fieldName])
}


// Si les document est déjà dans l'archive, on appelle onFinish, sinon, on appelle onInsert et on laisse eloInsertDocumentEnd appeler onFinish
// The event called on the start pressing Ok in the indexDialog
function eloIndexDialogOkStart(indexDialogAdapter) {
	log.info("Pack.eloIndexDialogOkStart")
    if (!indexDialogAdapter.isSearch()) {
        var res
        // Si le document est nouveau et dans la boite de réception, on appelle `onInsert`, sinon, `onFinish`.
        if (indexDialogAdapter.isNewEntry()) {
            var intrayDocument = proto.pack.jc.Pack.getIntrayDocument(indexDialogAdapter)
            if (intrayDocument) {
                res = proto.pack.jc.Pack.callEvent("onInsert", [
                    indexDialogAdapter,
                    function (parentId, version, comment, isMilestone, updateDocDate) {
                        intrayDocument.setSord(indexDialogAdapter.getSord())
                        if (parentId && version && comment && isMilestone && updateDocDate)
                            intrayDocument.insertIntoArchive(parentId, version, comment, isMilestone, updateDocDate)
                        else
                            intrayDocument.insertIntoArchive(parentId, version, comment || "")
                    }
                ])
            }
        }
        else {
            var id = indexDialogAdapter.getId()
            var res = proto.pack.jc.Pack.callEvent("onFinish", [indexDialogAdapter, id])
            archive.getElement(id).refresh()
        }
        return res
    }
}

// The event called on document insert process end
function eloInsertDocumentEnd(archiveDocument) {
	log.info("Pack.eloInsertDocumentEnd")
    var res = proto.pack.jc.Pack.callEvent("onFinish", [archiveDocument, archiveDocument.getId()])
    archiveDocument.saveSord()
    archiveDocument.refresh()
    return res
}

// Prints log based if debug is enabled
function printDebugLog(log_text, debug) {
    if (debug) {
        log.info(log_text)
    }
}

// Shows message box if debug is enabled
function showDebugBox(title, content, debug) {
    if (debug) {
        workspace.showInfoBox(title, content)
    }
}

//Shows alert box
function showAlertBox(title, content){
        workspace.showAlertBox(title, content)
}