/**
 * Utilité:
 *   Ajoute un bouton pour simplifier l'entrée d'utilisateurs dans le champ sélectionné.
 *   Utilisé pour émuler le comportement de Quickcheck
 *   Devrait être utilisé en conjonction avec `StartWrokflow`.
 *   Une fois les utilisateurs sélectionnés, ils sont entrés ainsi:
 *       utilisateur_1 / utilisateur_2
 *       utilisateur_1 + utilisateur_2
 *   Le signe dépend du champ "En série" ou "En parallèle"
 *
 * Configuration:
 *   "ActorsDialog": {
 *       "field": "ACTORS"
 *   }
 *
 * Configuration optionnelle:
 *   "ActorsDialog": {
 *       "field": "ACTORS",
 *       "showDialog": true
 *   }
 */

/**
 * Description in English
 * This util adds the button for making user selecting process easier
 * To show which is used for selection users: set "field" value in .config file
 * When users are selected the value has next options:
 *     user_1 / user_2
 *	   user_1 + user_2
 * The sign depends on type of field: series or parallel
 * You can add the exclusion of users in user list using "userExclusion" in .config
 * You can enable only one of next option: series or parallel, using  "distributionSerial": true or "distributionParalel": true in .config
 * If both are disabled in .config, they will be enabled in the code, because it is probably a mistake
 * You can enable the ability to select only one user using "singleUserAllow": true in .config, as default it is false
 *
 * Configuration examples:
 *
 *   "ActorsDialog": {
 *       "field": "ACTORS"
 *   }
 *
 *   "ActorsDialog": {
 *       "field": "ACTORS",
 *       "showDialog": true,
 *		 "singleUserAllow": true,
 *       "distributionSerial": false,
 *       "distributionParalel": false,
 *		 "userExclusion": [
 *               "Test",
 *               "Admin" ]         
 *   }
 */

//@include lib_Class
//@include lib_proto.pack.jc.utils.GetUsers
//@include lib_proto.pack.jc.PackFunction


sol.define("ActorsDialog", {
    extend: "proto.pack.jc.PackFunction",

    // Class initialize event
    initialize(config) {
        // Read values from config on initialize
        if (!config.field) {
            throw "ActorsDialog error: field config must be a string" // Check if config contains field
        }

		// Read config
        this.fieldName = config.field
		this.singleUserAllow = config.singleUserAllow || false
		this.distributionSerial = config.distributionSerial || false
		this.distributionParalel = config.distributionParalel || false
		
		// If both option are false, probably it is a mistake and change values to true
		if(!this.distributionSerial && !this.distributionParalel)
		{
			this.distributionSerial = true
			this.distributionParalel = true
		}     

        // If next two params aren't set they take FALSE value. The util doesn't start working while it isn't TRUE value in "showDialog" .config
        this.showDialog = config.showDialog || false
        this.userExclusion = config.userExclusion || []
		
		// Read debug config
		this.debug = shouldWriteLogsGlobal // Take global value
		
		// The local config is more powerful than global
		if(config.shouldWriteLogs == false){
			this.debug = false
		}
		
		if(config.shouldWriteLogs == true){ 
			this.debug = true
		}
		
		 log.info("ActorsDialog.Debug: " + this.debug)
    },

    // Event called on IndexDialog initilize
    onInit(indexDialogAdapter) {
		printDebugLog("ActorsDialog.onInit",this.debug)
		
		// Check does the field exists
        try {
            var field = indexDialogAdapter.getObjKey(this.fieldName)
        } catch (e) {
			printDebugLog("ActorsDialog: " + e,this.debug)
			showDebugBox("ActorsDialog", "Warning: The input field: " + this.fieldName + " doesn't exist", this.debug)
        }
		
        // Check should we add the button which spawns dialog box with users from "showDialog" in .config
        if (this.showDialog) {
            this.addButton(indexDialogAdapter)
        }
    },

    // Add button for choosing user
    addButton(indexDialogAdapter) {
        try {
			printDebugLog("ActorsDialog.addButton: " + this.fieldName,this.debug)
            indexDialogAdapter.getObjKey(this.fieldName).addButton(
                "...",
                () => {
                let result = this.displayActorsDialog()
                    if (result) {
                        // Set selected values into field
                        indexDialogAdapter.setObjKeyValue(this.fieldName, result)
                    }
            },
                this,
                3)
        } catch (e) {
			printDebugLog("ActorsDialog.addButton: " + this.fieldName + "doesn't exist",this.debug)
        }
    },

    // This method creates, fills and displays dialog with user list
    displayActorsDialog() {
		printDebugLog("ActorsDialog.displayActorsDialog",this.debug)
        let fields = {
            type: null,
            users: [],
        }
		
		
		// Create types array based on the config
        let types = []
		
		if(this.distributionSerial){
			types.push('Série')
		}
		
		if(this.distributionParalel){
			types.push('Parallel')
		}

        // Get user names, except users from Exclusion
        let userNames = proto.pack.jc.utils.GetUsers.getUserNames(this.userExclusion)

            let selectedUserList = []

            let gridHeight = 1 + 1 + 1 + userNames.length // TypeHeader, Type, UserHeader, Users
            let fieldGridIndex = 1 // Makes it easier to add fields, increment when adding a field.

            // Create dialog with inputed Height
            let dialog = workspace.createGridDialog('Acteur(s)', 1, gridHeight)
			
			// Lower is the box filling process 
            dialog.setStatusYellow('Veuillez sélectionner un type et au moin un utilisateur.')
            dialog.setDialogId('Actors')
            let panel = dialog.getGridPanel(){ // Type
            // Header
            let typeHeader = panel.addLabel(1, fieldGridIndex++, 1, 'Type de validation')
                typeHeader.setBold(true)
                // Field
                fields.type = panel.addComboBox(1, fieldGridIndex++, 1, types, true)
                fields.type.addChangeEvent(() => this.validateActorsDialog(fields, dialog), this)
                fields.type.setEditable(false)
        } { // Users
            // Header
            let userHeader = panel.addLabel(1, fieldGridIndex++, 1, 'Utilisateurs')
                userHeader.setBold(true)
                // Fields
                userNames.forEach((user, i) => {
                    let userField = panel.addCheckBox(1, fieldGridIndex++, 1, user, false)
                        userField.addChangeEvent(() => {
                            if (userField.isChecked())
                                selectedUserList.push(user);
                            else
                                selectedUserList = selectedUserList.filter(v => v != user)
                        }, this)
                        userField.addChangeEvent(() => this.validateActorsDialog(fields, dialog), this)
                        fields.users.push(userField)
                })
        } { // Show dialog
            if (dialog.show()) {
				// If both option are enabled follow the first scenario
				if(this.distributionSerial && this.distributionParalel){
                if (fields.type.getSelectedIndex() == 1) {
                    return selectedUserList.reverse().join(' / ')
                } else {

                    return selectedUserList.reverse().join(' + ')
                }}
				
				// If only serial option enabled
				if(this.distributionSerial){
					 return selectedUserList.reverse().join(' + ')
				}
				
				// If only second option enabled
				if(this.distributionParalel){
					return selectedUserList.reverse().join(' / ')
				}
				
            }
        }
    },

    // This method sets status for the dialog, after each action
    validateActorsDialog(fields, dialog) {
		printDebugLog("ActorsDialog.validateActorsDialog",this.debug)

        // Check does any type of validation selected
        if (!fields.type.getText()) {
            return dialog.setStatusYellow('Veuillez sélectionner un type de validation.')
        }
        // Calculate selected users count
        let checkedCount = 0
        fields.users.forEach((user) => {
            if (user.isChecked())
                checkedCount++
        })
		
		// Check if one user picking isn't allowed, but you had picked only one user
		if (checkedCount < 2 && !this.singleUserAllow) {
            return dialog.setStatusYellow("One user can't be choosen. You need at least 2 users to be selected")
        }

        // If selected user count is 0, set status "At least one user must be selected"
        if (checkedCount < 1 && this.singleUserAllow) {
            return dialog.setStatusYellow('Il faut sélectionner au moin un utilisateur.')
        }			
		
        // Set normal status if no issues
        dialog.setStatusNormal('')
    },
})
