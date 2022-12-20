//- Scripts créés par Steve Medina en 200?-2019 pour PROTOCOL SA: 
//    Scripts contenant la plupart des fonctions actuelles du PROTOPACK 
//    mais dans des fichiers trop complexes et peu ou pas commentés, 
//    difficilement utilisables par quelqu'un d'autre que l'auteur !
//- Modifiés par Guillaume Dufresne en 2020-2021 pour PROTOCOL SA : 
//    Principales fonctions isolées dans des scripts plus réduits 
//    pour plus de lisibilité et d'adaptation.
//- Modifié par Edgar Lucio le 13/10/2021 pour PROTOCOL SA: 
//    Suppression de quelques fonctions et commentaires redondants, 
//    corrections pour que les paramètres viennent exclusivement du 
//    fichier my_pack.config.json afin que ce fichier de configuration 
//    mérite enfin complètement son nom, ajout/modification commentaires.
//- Modifié par Edgar Lucio le 17/11/2021 pour Protocol SA:
//    modification de la fonction sendNotification pour qu'elle ajoute 
//    une info dans le texte libre de chaque document quand une notification 
//    est créée.
//
// *******************************************************************************************************
// ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION //
// Ce fichier devrait être pleinement fonctionnel et n'a pas besoin d'être modifié !!
// ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION //
// *******************************************************************************************************
//Fonction du script:
//  Crée un rappel/notification à un ou plusieurs utilisateurs.
//  Ajoute un bouton au champ spécifié(dans config) pour ouvrir une fênetre dans laquelle on peut 
//  séléctionner le titre de la notification/du rappel ainsi que le ou les destinataires.
//  Le rappel est créé en suivant le format suivant: `Texte du rappel¶utilisateur_1¶utilisateur_2`
//  La configuration se fait par le fichier my_pack.config.json.


//@include lib_Class
//@include lib_sol.common.ObjectUtils
//@include lib_sol.common.DateUtils
//@include lib_sol.common.WfUtils
//@include lib_sol.common.Roles
//@include lib_proto.pack.jc.utils.GetUsers
//@include lib_proto.pack.jc.PackFunction

/** Description in Enlglish
 *
 * This util generates and sends the notification for selected users or groups
 * This script works only if "field" params is set in .config
 * To add button which spawns dialogBox for easier user picking, you need to set "showDialog" as true
 * You can exclude some users from selection menu using "userExclusion"
 * You can add user groups in selection list with specific prefix using "groupPrefix"
 * To set the notification name and text, use "notifications" in .config
 *
 * Configuration example:
 *
 * "BasicReminder": {
 *            "field": "ADD_TASK",
 *            "showDialog": true,
 *            "split": "¶",
 *            "groupPrefix": "grp_",
 *            "userExclusion": [
 *                "_Test",
 *                "ELO_Admin",
 *            ],
 *            "notifications": ["1.Pour info","À classer"]
 *        }
 */


// Class initialize event
sol.define("BasicReminder", {
    extend: "proto.pack.jc.PackFunction",

    initialize(config) {
		// Check is config file correct
        if (!sol.common.ObjectUtils.isObject(config)) {
            throw "Erreur script lib_proto.pack.jc.func.BasicReminder.js (ligne 40), veuillez contacter Protocol (021/623 77 77)"
        }
		
		// Check is field inputed
        if (!sol.common.ObjectUtils.isString(config.field)) {
            throw "Erreur script lib_proto.pack.jc.func.BasicReminder.js (ligne 41), veuillez contacter Protocol (021/623 77 77)"
        }
		
		
        //Importation des 6 paramètres selon valeurs fournies dans fichier de configuration
        this.fieldName = config.field

        this.showDialog = config.showDialog
        this.groupPrefix = config.groupPrefix
        this.userExclusion = config.userExclusion
        this.notifications = config.notifications
        this.nomVariable = config.nomVariable
        this.splitter = config.splitter || "/"

		
		// Read debug config
		this.debug = shouldWriteLogsGlobal // Take global value
		
		// The local config is more powerful than global
		if(config.shouldWriteLogs == false){
			this.debug = false
		}
		
		if(config.shouldWriteLogs == true){ 
			this.debug = true
		}
		
		 log.info("BasicReminder.Debug: " + this.debug)
    },
    //Initialisation de la fonction du script, fait appel a une fonction qui crée le bouton pour accèder 
    //aux choix users/groups
	// Event called on IndexDialog initilize
    onInit(indexDialogAdapter) {
		printDebugLog("BasicReminder.onInit",this.debug)
		// Check for correct input field
		try{
			var value = indexDialogAdapter.getObjKeyValue(this.fieldName)
		}
		catch(e){
			// Creates warning 
			printDebugLog("BasicReminder.onInit: " + e,this.debug)
			showDebugBox("BasicReminder", "Warning: Next input field doesn't exist: " + this.fieldName,this.debug);
		}
		
        if (this.showDialog) {
            this.addButton(indexDialogAdapter)
        }
    },
    //Clôture de la fonction du script, fait appel a une fonction qui rassemble 
    //les paramètres séléctionnés pour créer la notification/rappel
	// Event onFinish indexDialog
    onFinish(indexDialogAdapter, id) {
		printDebugLog("BasicReminder.onFinish",this.debug)
        this.sendNotification(indexDialogAdapter, id) // Send the notification on the end
    },
    //Fonction qui sert à rassembler les paramètres choisis et créer la notification/rappel
    //ajout le 17/11/2021 de la partie entre //*, reprise depuis le même fichier mais à la 
    //commune de Vaux-sur-Morges, et qui ajoute dans le texte libre de la fenetre d'indexation 
    //d'un document une info de création de notification.
	 // This function creates and sends the notificaition
    sendNotification(indexDialogAdapter, id) {
		printDebugLog("BasicReminder.sendNotification",this.debug)
        var fieldText = indexDialogAdapter.getObjKeyValue(this.fieldName) // Getting the value from the field
		
		// Check if value exists
        if (fieldText != "") { 
            var parts = String(fieldText).split(this.splitter) // Split the value on the parts using "split" from the config
            var title = "Notif. " + indexDialogAdapter.getName() + ": " + parts.shift() // Generating the notification's title
            
			// If targets more 0 create and send the notification
			if (parts.length > 0) {
				
				// The notification
                sol.common.WfUtils.createReminder(id, {
                    userIds: parts,
                    name: title
                })
                //*
                printDebugLog("Reminder created !",this.debug)
                var sord = sol.common.RepoUtils.getSord(id) // Getting thw sord of current file
                printDebugLog("Sord : " + sord.id,this.debug)
                var currentDesc = sord.desc // Getting the sord's description
                printDebugLog("Description : " + currentDesc,this.debug)
                var today = new Date() // Getting the current date
                printDebugLog("Today : " + today,this.debug)
                let newDesc = currentDesc // Creating a new description
                if(newDesc != "") {
                    newDesc += "\n"
                }
				
				// Run throw all users
                parts.forEach(function(user, index) {
                    if(index > 0) {
                        newDesc += "\n"
                    }
					// Filling the description by an user names and the current date
                    newDesc += "> " + ("0" + today.getDate()).slice(-2) + "/" + ("0" + (today.getMonth() + 1)).slice(-2) + "/" + today.getFullYear() + " - Notification envoy\u00e9e \u00e0 " + user
                })
                printDebugLog("New description : " + newDesc,this.debug)
                sord.setDesc(newDesc) // Set new description for the current sord
                printDebugLog("Sord updated !",this.debug)
                printDebugLog("Memo after update : " + sord.desc,this.debug)
                printDebugLog("indexDialogAdapter : " + indexDialogAdapter,this.debug);
                indexDialogAdapter.setSord(sord) // Saving the current sord
                //*
                indexDialogAdapter.setObjKeyValue(this.fieldName, "")
            }

        }
    },
    //Fonction qui crée le bouton pour accèder aux users/groups
	// Add button for choosing user
    addButton(indexDialogAdapter) {
		// Try to add button
		try{
        indexDialogAdapter.getObjKey(this.fieldName).addButton(
            "...",
            () => {
                let result = this.displayNotificationDialog()
                if (result) {
                    indexDialogAdapter.setObjKeyValue(this.fieldName, result)
                }
            },
            this,
            3
        )}catch(e){
			printDebugLog("BasicReminder.addButton: " + e,this.debug)
		}
    },
    //Fonction qui gére et affiche la fênetre pour les notifications/rappels
	// This method creates, fills and displays dialog with user list and groups
    displayNotificationDialog() {
        let fields = {
            text: null,
            users: [],
            groups: [],
        }
        //Chargement des textes des notif/rappels selon infos dans fichier config
        let texts = this.notifications 
        //Chargement de la liste d'utilisateurs, sauf ceux nommés dans la liste d'exclusion(fichier config)
        let userNames = proto.pack.jc.utils.GetUsers.getUserNames(this.userExclusion) 
        //Chargement de la liste des groupes dont le nom commence par le préfixe donné dans fichier config
        let groupNames = proto.pack.jc.utils.GetUsers.getGroupNamesPrefix(this.groupPrefix) 

        //Partie qui concerne l'apparence et les élèments constituant la fenêtre de notifs/rappels

        let gridHeight = 1 + 1 + 1 + userNames.length + 1 + groupNames.length // TextHeader, Text, UserHeader, Users, GroupHeader, Groups
        let dialog = workspace.createGridDialog('Notification(s)', 1, gridHeight)
        dialog.setStatusYellow('Veuillez sélectionner un texte et au moins un utilisateur ou groupe.')
        dialog.setDialogId('Notification')
        let panel = dialog.getGridPanel()

        let fieldGridIndex = 1 // Makes it easier to add fields, increment when adding a field.

        { // Text
            // Header
            let textHeader = panel.addLabel(1, fieldGridIndex++, 1, 'Texte de la notification')
            textHeader.setBold(true)
            // Field
            fields.text = panel.addComboBox(1, fieldGridIndex++, 1, texts, true)
            fields.text.addChangeEvent(() => this.validateNotificationDialog(fields, dialog), this)
        }

        { // Users
            // Header
            let userHeader = panel.addLabel(1, fieldGridIndex++, 1, 'Utilisateurs')
            userHeader.setBold(true)
            // Fields
            userNames.forEach((user, i) => {
                let userField = panel.addCheckBox(1, fieldGridIndex++, 1, user, false)
                userField.addChangeEvent(() => this.validateNotificationDialog(fields, dialog), this)
                fields.users.push(userField)
            })
        }

        { // Group
            // Header
            let groupHeader = panel.addLabel(1, fieldGridIndex++, 1, 'Groupes')
            groupHeader.setBold(true)
            // Fields
            groupNames.forEach((group, i) => {
                let groupField = panel.addCheckBox(1, fieldGridIndex++, 1, group, false)
                groupField.addChangeEvent(() => this.validateNotificationDialog(fields, dialog), this)
                fields.groups.push(groupField)
            })
        }
        //Affichage et retours de données pour inscription dans masque d'indexation
        { 
            if (dialog.show()) {
                let parts = []

                parts.push(fields.text.getText())

                fields.users.forEach((user) => {
                    if (user.isChecked())
                        parts.push(user.getText())
                })

                fields.groups.forEach((group) => {
                    if (group.isChecked())
                        parts.push(group.getText())
                })

                return parts.join(this.splitter)
            }
        }
    },
    //validation de saisie
	// This function checks if the data filled correctly
    validateNotificationDialog(fields, dialog) {
		 // Check does the notification text exist
        if (!fields.text.getText()) return dialog.setStatusYellow('Veuillez sélectionner un texte.')


		// Check the count of notification targets
        let checkedCount = 0
        fields.users.forEach((user) => { if (user.isChecked()) checkedCount++ })
        fields.groups.forEach((group) => { if (group.isChecked()) checkedCount++ })
			
		// At least one target must exist
        if (checkedCount == 0) return dialog.setStatusYellow('Il faut sélectionner au moins un utilisateur ou un groupe')


		// Set status normal if no issues
        dialog.setStatusNormal('')
    }
})