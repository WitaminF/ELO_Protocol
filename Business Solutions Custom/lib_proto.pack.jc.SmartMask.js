//@include lib_Class
//@include lib_sol.common.ObjectUtils
//@include lib_proto.pack.jc.PackFunction
//@include lib_sol.common.SordUtils.js
//@include lib_sol.common.ix.FunctionBase.js



sol.define("SmartMask", {
    extend: "proto.pack.jc.PackFunction",

    //Class initialize event
    initialize(config) {

        this.editableFields = config.editableFields
        this.visibleFields = config.visibleFields
        this.commonFields = config.commonFields
        this.commonPath = config.commonPath
        this.csDefaultFields = config.csDefaultFields
        this.csInvoiceFields = config.csInvoiceFields
        this.csContractFields = config.csContractFields
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


        printDebugLog("BaseMaskScript.Debug" + this.debug,this.debug)
    },

    onInit: function (indexDialog) {
        this.process(indexDialog)
        printDebugLog("BaseMaskScript.onInit",this.debug)
    },

    onFinish: function(indexDialog, id){

    },

    onNameExit: function (indexDialog) {

        printDebugLog("BaseMaskScript.onNameExit",this.debug)

    },
    onDateExit: function (indexDialog) {
        printDebugLog("BaseMaskScript.onDateExit",this.debug)

    },

    onFieldExit: function (indexDialog, fieldName) {
        this.process(indexDialog)
        printDebugLog("BaseMaskScript.onFieldExit",this.debug)

    },

    process(indexDialog) {

        let pathReceiver = "PDC_DEPOT"
        let refReceiver = "PDC_REF"

        let classement = getValue("CLASSEMENT")
        let docType = getValue("TYPE_DOC")
        let supplier = getValue("FOURNISSEUR")
        let customer = getValue("CLIENT")
        let employee = getValue("COLLABORATEUR")
        let accountNb = getValue("NO_COMPTE")

        let editableFields = this.editableFields
        let visibleFields = this.visibleFields
        let commonFields = this.commonFields
        let commonPath = this.commonPath
        let csDefaultFields = this.csDefaultFields
        let csInvoiceFields = this.csInvoiceFields
        let csContractFields = this.csContractFields
        let supplierPath = this.supplierPath
        let customerPath = this.customerPath
        let hrFields = this.hrFields
        let hrPath = this.hrPath

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
                    case "Contrats" : {
                        pushField("csContractFields")
                        break
                    }
                    case "Factures" :{
                        pushField("csInvoiceFields")
                        break
                    }
                    default : {
                        pushField("csDefaultFields")
                    }
                }
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
                break
            }
            case "Ressources Humaines" : {
                switch(docType) {
                    case "Dossiers Personnels" : {
                        pushField("hrFields")
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

        //FONCTIONS

        function pushField(state){
            switch (state){
                case "init" : {
                    visibleFields.lenght = 0;
                    emptyPathAndRef()
                    break
                }
                case "default" : {
                    visibleFields = commonFields
                    setPath(commonPath)
                    break
                }
                case "csDefaultFields" : {
                    visibleFields = csDefaultFields.slice(0)
                    break
                }
                case "csContractFields" : {
                    visibleFields = csContractFields.slice(0)
                    break
                }
                case "csInvoiceFields" : {
                    visibleFields = csInvoiceFields.slice(0)
                    break
                }
                case "hrFields" : {
                    visibleFields = hrFields.slice(0)
                    break
                }
            }
            showHide(visibleFields)
        }

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


        function emptyPathAndRef(){
            emptyPath()
            emptyRef()
        }

        function emptyPath(){
            setValue(pathReceiver, "")
        }

        function emptyRef(){
            setValue(refReceiver, "")
        }

        function showHide(list){
            editableFields.forEach(f=>{
                (!list.includes(f)) ? hide(f) :show(f)
            })
        }

        function getValue(field){
            return String(indexDialog.getObjKeyValue(field))
        }

        function setValue(field, value){
            indexDialog.setObjKeyValue(field, value)
        }

        //Rend visible une liste de champs
        function show(field){
            indexDialog.getObjKey(field).setEnabled(true)
        }

        //Rend invisible un champ et efface les valeurs
        function hide(field){
            indexDialog.getObjKey(field).setEnabled(false)
            setValue(field, "")

        }

        //D�finit le chemin de d�p�t pour le champ correspondant

    }
})