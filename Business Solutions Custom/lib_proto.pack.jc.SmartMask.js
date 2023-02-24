
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
        this.adminFields = config.adminFields
        this.proactifPath = config.proactifPath
        this.customerPath = config.customerPath
        this.supplierPath = config.supplierPath
        this.hrFields = config.hrFields
        this.hrPath = config.hrPath


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
        //Pièces comptables
        let adminFields = this.adminFields

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
        let designSuppl = getValue("DESIGN_SUPPL")
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
            case "Carnet d'heures" :{
                setValue("CLASSEMENT", "Client & Fournisseur")
                setValue("TYPE_DOC", "Carnet d'heures")
                setValue("DEPARTEMENT", "INFRA")
                this.process(indexDialog)
                break
            }
            case "Configuration et tarif Hosting" :{
                setValue("CLASSEMENT", "Client & Fournisseur")
                setValue("TYPE_DOC", "Contrat")
                setValue("DEPARTEMENT", "INFRA")
                setValue("INFO_COMPL", "Configuration et tarif Hosting")
                this.process(indexDialog)
                break
            }
            case "Facture FG" :{
                setValue("CLASSEMENT", "Client & Fournisseur")
                setValue("TYPE_DOC", "Facture")
                setValue("DESIGN_SUPPL", "Facture frais généraux")
                setValue("DEPARTEMENT", "INFRA")
                setValue("PROCESSUS", "Facture")
                this.process(indexDialog)
                break
            }
            case "Facture A" :{
                setValue("CLASSEMENT", "Client & Fournisseur")
                setValue("TYPE_DOC", "Facture")
                setValue("DESIGN_SUPPL", "Facture achat")
                setValue("DEPARTEMENT", "INFRA")
                setValue("PROCESSUS", "Facture")
                this.process(indexDialog)
                break
            }
            case "Proactif avec intervention" : {
                setValue("CLASSEMENT", "Client & Fournisseur")
                setValue("TYPE_DOC", "Rapport proactif")
                setValue("DEPARTEMENT", "INFRA")
                setValue("PROCESSUS", "Proactif")
                setValue("PROACTIF", "AVEC")
                this.process(indexDialog)
                break
            }
            case "Proactif sans intervention" : {
                setValue("CLASSEMENT", "Client & Fournisseur")
                setValue("TYPE_DOC", "Rapport proactif")
                setValue("DEPARTEMENT", "INFRA")
                setValue("PROCESSUS", "Proactif")
                setValue("PROACTIF", "SANS")
                this.process(indexDialog)
                break
            }
            case "Contrat" : {
                setValue("CLASSEMENT", "Client & Fournisseur")
                setValue("TYPE_DOC", "Contrat")
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
            case "Vente" : {
                pushField("default")
                break
            }
            case "Protocol Interne" : {
                pushField("default")
                break
            }
            case "Technique Interne" : {
                pushField("default")
                break
            }
            case "Admin" : {
                pushField("adminFields")
                break
            }
            case "Client & Fournisseur" : {
                switch(docType) {
                    case "Rapport proactif" :{
                        pushField("csProactif")
                        break
                    }
                    case "Contrat" : {
                        pushField("csContract")
                        break
                    }
                    case "Facture" :{
                        pushField("csInvoice")
                        break
                    }
                    default : {
                        pushField("csDefault")
                    }
                }
                if (docType === "Rapport proactif"){
                    if (customer !=="")
                    setCsPath(proactifPath, "Client")
                    else {
                        emptyPath()
                    }
                }
                else {
                    if (customer === "" && supplier ===""){
                        emptyPathAndRef()
                    }else if(customer !== "" && supplier ===""){
                        setCsPath(customerPath, "Client")
                        emptyRef()
                    }else if (customer === "" && supplier !== ""){
                        setCsPath(supplierPath, "Fournisseur")
                        emptyRef()
                    }else {
                        setCsPath(customerPath, "Client")
                        setCsRef(supplierPath, "Fournisseur")
                    }
                }
                break
            }
            case "Ressource Humaine" : {
                switch(docType) {
                    case "Dossier Personnel" : {
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
                case "adminFields":{
                    visibleFields = adminFields.slice(0)
                    setPath(commonPath)
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
            x === "Client" ? path = ">Client>" : path = ">Fournisseur>"
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
            x === "Client" ? refPath = "Client>" : refPath = "Fournisseur>"
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