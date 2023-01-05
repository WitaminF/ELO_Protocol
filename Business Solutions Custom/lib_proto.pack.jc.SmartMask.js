
/****************************************************************************************


              ////////////  ////////////  ////////////  ////////////  //////////// TM
             //        //  //        //  //        //       //       //        //
            //        //  //        //  //        //       //       //        //
           //        //  //        //  //        //       //       //        //
          ////////////  ////////////  //        //       //       //        //
         //            //      //    //        //       //       //        //
        //            //       //   //        //       //       //        //
       //            //        //  ////////////       //       //////////// #SmartMask


       > Propriété de Protocol SA, Rue de Sébeillon 9b, 1000 Lausanne

       > Script développé par Florent Scheibler - 2022/2023
       > Dépôt git du projet : https://github.com/WitaminF/ELO_Protocol
       > Accès : scheiblerf@gmail.com

 *****************************************************************************************/

//@include lib_Class
//@include lib_sol.common.ObjectUtils
//@include lib_proto.pack.jc.PackFunction
//@include lib_sol.common.SordUtils.js
//@include lib_sol.common.ix.FunctionBase.js

sol.define("SmartMask", {
    extend: "proto.pack.jc.PackFunction",

    //Class initialize event
    initialize(config) {
        printDebugLog("SmartMask.initialize",this.debug)

        //Valeur fichier config
        this.editableFields = config.editableFields
        this.visibleFields = config.visibleFields
        this.commonFields = config.commonFields
        this.commonPath = config.commonPath
        this.csDefaultFields = config.csDefaultFields
        this.csInvoiceFields = config.csInvoiceFields
        this.csContractFields = config.csContractFields
        this.csProactifFields = config.csProactifFields
        this.proactifPath = config.proactifPath
        this.customerPath = config.customerPath
        this.supplierPath = config.supplierPath
        this.hrFields = config.hrFields
        this.hrPath = config.hrPath

        //this.year = new Date().getFullYear()
        //this.month = new Date().getMonth()


        // The local config is more powerful than global
        if (config.shouldWriteLogs === false) {
            this.debug = false
        }

        if (config.shouldWriteLogs === true) {
            this.debug = true
        }

        this.process(indexDialog)
        printDebugLog("SmartMask.Debug" + this.debug,this.debug)
    },

    onInit: function (indexDialog) {
        let year = new Date().getFullYear()
        indexDialog.setObjKeyValue("YEAR", year)

        let month = new Date().getMonth() + 1

        if (month < 10) {
            month = "0" + month
        }

        indexDialog.setObjKeyValue("MONTH", month)
        this.process(indexDialog)
        printDebugLog("SmartMask.onInit",this.debug)
    },

    onFinish: function(indexDialog, id){
        printDebugLog("SmartMask.onFinish",this.debug)
    },

    onNameExit: function (indexDialog) {
        printDebugLog("SmartMask.onNameExit",this.debug)
    },

    onDateExit: function (indexDialog) {
        printDebugLog("SmartMask.onDateExit",this.debug)
    },

    onFieldExit: function (indexDialog, fieldName) {
        this.process(indexDialog)
        printDebugLog("SmartMask.onFieldExit",this.debug)
    },

    process(indexDialog) {

        //Champs principaux, éditable, cahés à l'initialisation
        let editableFields = this.editableFields

        //Champs visible, vide à l'initialisation
        let visibleFields = this.visibleFields

        //Champs éditables pour les documents communs
        let commonFields = this.commonFields

        //Champs éditables pour les documents particuliers
        //Fichiers clients et fournisseurs
        //Par défaut
        let csDefaultFields = this.csDefaultFields
        //Facture
        let csInvoiceFields = this.csInvoiceFields
        //Contrat
        let csContractFields = this.csContractFields
        //Proactif
        let csProactifFields = this.csProactifFields

        let hrFields = this.hrFields

        //Champs utilisés pour les chemin de dépot/référence
        //Documents communs
        let commonPath = this.commonPath

        //Documents clients et fournisseurs
        let supplierPath = this.supplierPath
        let customerPath = this.customerPath
        let proactifPath = this.proactifPath

        //Documents RH pour un collaborateur
        let hrPath = this.hrPath

        //Attribution de valeur/variables
        //Récupère la première lettre fournisseurs pour la mettre dans le champ FOURNISSEUR_FL
        let flFournisseur = getValue("FOURNISSEUR")
        setValue("FOURNISSEUR_FL", flFournisseur.charAt(0))

        //Récupère la première lettre client pour la mettre dans le champ CLIENT_FL
        let flClient = getValue("CLIENT")
        setValue("CLIENT_FL", flClient.charAt(0))

        //Attribution de variable pour le champ dépôt et référence
        let pathReceiver = "PDC_DEPOT"
        let refReceiver = "PDC_REF"

        //Attribution de variable en fonction de la valeur d'un champ
        let classement = getValue("CLASSEMENT")
        let docType = getValue("TYPE_DOC")
        let supplier = getValue("FOURNISSEUR")
        let customer = getValue("CLIENT")
        let employee = getValue("COLLABORATEUR")
        let accountNb = getValue("NO_COMPTE")


        //En fonction du type de document, détermine le classement
        //ainsi que les champs visibles et éditables
        switch (classement){
            case "" : {
                switch (docType) {
                    case "" : {
                        pushField("init")
                        break
                    }
                }
                break
            }
            case "Factures FG" :{
                setValue("CLASSEMENT", "Clients & Fournisseurs")
                setValue("TYPE_DOC", "Factures")
                setValue("DESIGN_SUPPL", "Factures frais généraux")
                setValue("DEPARTEMENT", "INFRA")
                setValue("PROCESSUS", "Facture")
                this.process(indexDialog)
                break
            }
            case "Factures A" :{
                setValue("CLASSEMENT", "Clients & Fournisseurs")
                setValue("TYPE_DOC", "Factures")
                setValue("DESIGN_SUPPL", "Factures achats")
                setValue("DEPARTEMENT", "INFRA")
                setValue("PROCESSUS", "Facture")
                this.process(indexDialog)
                break
            }
            case "Proactifs avec intervention" : {
                setValue("CLASSEMENT", "Clients & Fournisseurs")
                setValue("TYPE_DOC", "Rapports proactifs")
                setValue("PROCESSUS", "Proactif")
                setValue("PROACTIF", "AVEC")
                this.process(indexDialog)
                break
            }
            case "Proactifs sans intervention" : {
                setValue("CLASSEMENT", "Clients & Fournisseurs")
                setValue("TYPE_DOC", "Rapports proactifs")
                setValue("PROCESSUS", "Proactif")
                setValue("PROACTIF", "SANS")
                this.process(indexDialog)
                break
            }
            case "Contrats" : {
                setValue("CLASSEMENT", "Clients & Fournisseurs")
                setValue("TYPE_DOC", "Contrats")
                setValue("PROCESSUS", "Contrat")
                this.process(indexDialog)
                break
            }
            case "Marketing" : {
                pushField("default")
                break
            }
            case "Gouvernance" : {
                pushField("default")
                break
            }
            case "Ventes" : {
                pushField("default")
                break
            }
            case "Formations" : {
                pushField("default")
                break
            }
            case "Modèles et Templates" : {
                pushField("default")
                break
            }
            case "Procédures Interne" : {
                pushField("default")
                break
            }
            case "Techniques Interne" : {
                pushField("default")
                break
            }
            case "Admin" : {
                pushField("default")
                break
            }
            case "Clients & Fournisseurs" : {
                switch(docType) {
                    case "Rapports proactifs" :{
                        pushField("csProactif")
                        break
                    }
                    case "Contrats" : {
                        pushField("csContract")
                        break
                    }
                    case "Factures" :{
                        pushField("csInvoice")
                        break
                    }
                    default : {
                        pushField("csDefault")
                    }
                }
                if (docType === "Rapports proactifs" && customer !==""){
                    setCsPath(proactifPath, "Clients")
                }
                else {
                    if (customer === "" && supplier ===""){
                        emptyPathAndRef()
                    }else if(customer !== "" && supplier ===""){
                        setCsPath(customerPath, "Clients")
                        emptyRef()
                    }else if (customer === "" && supplier !== ""){
                        setCsPath(supplierPath, "Fournisseurs")
                        emptyRef()
                    }else {
                        setCsPath(customerPath, "Clients")
                        setCsRef(supplierPath, "Fournisseurs")
                    }
                }
                break
            }
            case "Ressources Humaines" : {
                switch(docType) {
                    case "Dossiers Personnels" : {
                        pushField("hr")
                        employee !== "" ? setPath(hrPath) : emptyPath()
                        break
                    }
                    default :{
                        pushField("default")
                        break
                    }
                }
            }
        }

        /**
         * En fonction de l'état du masque, affiche ou cache certains champs
         * @param state
         */
        function pushField(state){
            switch (state){
                case "init" : {
                    printDebugLog("SmartMask.state.init",this.debug)
                    visibleFields.lenght = 0;
                    emptyPathAndRef()
                    break
                }
                case "default" : {
                    printDebugLog("SmartMask.state.default",this.debug)
                    visibleFields = commonFields
                    setPath(commonPath)
                    break
                }
                case "csDefault" : {
                    printDebugLog("SmartMask.state.csDefaultFields",this.debug)
                    visibleFields = csDefaultFields.slice(0)
                    break
                }
                case "csContract" : {
                    printDebugLog("SmartMask.state.csContractFields",this.debug)
                    visibleFields = csContractFields.slice(0)
                    break
                }
                case "csInvoice" : {
                    printDebugLog("SmartMask.state.csInvoiceFields",this.debug)
                    visibleFields = csInvoiceFields.slice(0)
                    break
                }
                case "csProactif" : {
                    visibleFields = csProactifFields.slice(0)
                    break
                }
                case "hr" : {
                    printDebugLog("SmartMask.state.hrFields",this.debug)
                    visibleFields = hrFields.slice(0)
                    break
                }
            }
            showHide(visibleFields)
        }

        /**
         * Crée le chemin de dépot pour un document client/fournisseur
         *
         * @param list
         * @param x
         */
        function setCsPath(list, x){
            let path
            x === "Clients" ? path = ">Clients>" : path = ">Fournisseurs>"
            list.forEach(f =>{
                let value = getValue(f)
                if (value !== ""){
                    path += value + ">"
                }
            })
            setValue(pathReceiver, path)
        }

        /**
         * Crée le chemin de référence pour un document client/fournisseur
         *
         * @param list
         * @param x
         */
        function setCsRef(list, x){
            let refPath
            x === "Clients" ? refPath = "Clients>" : refPath = "Fournisseurs>"
            list.forEach(f =>{
                let value = getValue(f)
                if (value !== ""){
                    refPath += value + ">"
                }
            })
            setValue(refReceiver, refPath)
        }

        /**
         * Crée le chemin de dépot pour un document
         * @param list
         */
        function setPath(list){
            path = ">"
            list.forEach(f =>{
                let value = getValue(f)
                if (value !== ""){
                    path += value + ">"
                }
            })
            setValue(pathReceiver, path)
        }

        /**
         * Crée le chemin de référence pour un document
         * @param list
         */
        function setRef(list){
            let refPath = ">"
            list.forEach(f =>{
                let value = getValue(f)
                if (value !== ""){
                    refPath += value + ">"
                }
            })
            setValue(refReceiver, refPath)
        }


        /**
         * Vide le champ dépot et référence
         */
        function emptyPathAndRef(){
            emptyPath()
            emptyRef()
        }

        /**
         * Vide le champ dépot
         */
        function emptyPath(){
            setValue(pathReceiver, "")
        }

        /**
         * Vide le chemin de référence
         */
        function emptyRef(){
            setValue(refReceiver, "")
        }

        /**
         * En fonction des champs visible dans la liste VisibleFields
         * Rend éditable ou non un champ
         * @param list
         */
        function showHide(list){
            editableFields.forEach(f=>{
                (!list.includes(f)) ? hide(f) :show(f)
            })
        }

        /**
         * Récupère la valeur d'un champ
         * @param field
         * @returns {string}
         */
        function getValue(field){
            return String(indexDialog.getObjKeyValue(field))
        }

        /**
         * Attribue une valeur a un champ
         * @param field
         * @param value
         */
        function setValue(field, value){
            indexDialog.setObjKeyValue(field, value)
        }

        /**
         * Rend un champ éditable
         * @param field
         */
        function show(field){
            indexDialog.getObjKey(field).setEnabled(true)
        }

        /**
         * Rend un champ invisible et efface les valeurs
         * @param field
         */
        function hide(field){
            indexDialog.getObjKey(field).setEnabled(false)
            setValue(field, "")

        }


    }
})