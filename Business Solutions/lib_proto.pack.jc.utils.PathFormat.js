//@include lib_Class

sol.define("proto.pack.jc.utils.PathFormat", {
    singleton: true,

    /**
     * 
     * @param {IndexDocument} indexedElement 
     * @param {*} format 
     * @returns 
     */
    parseFormat(indexedElement, format) {
        format = String(format)
        var path = ""
        var currentFieldName = ""
        var inField = false

        // Parsing the format is split in two, first we read until the first { which sets `inField` then read until } which resets `inField`.
        // This is probably do-able with regular expressions but parsing character by character works too.
        for (var i = 0; i < format.length; i++) {
            var ch = format.charAt(i) // Curren character
            if (inField) {
                switch (ch) {
                    // Parsing the contents of {}, pass the character to the currentFieldName buffer, once the bracket closes, read the field with the given name.
                    case "{": throw "Unexpected '}' in BasicFiling format"
                    case "}": {
                        path += this.getFieldOrFunction(indexedElement, currentFieldName)
                        inField = false
                    } break
                    default: {
                        currentFieldName += ch
                    }
                }
            } else {
                // Parsing the path, simply pass to the character to the path
                switch (ch) {
                    case "}": throw "Unexpected '}' in BasicFiling format"
                    case "{": {
                        currentFieldName = ""
                        inField = true
                    } break
                    default: {
                        path += ch
                    }
                }

            }
        }
        return path
    },

    getFieldOrFunction(indexedElement, str) {
        var path = ""
        if (str.startsWith("#")) {
            path = this.processFunction(indexedElement, str)
        } else {
            path = indexedElement.getObjKeyValue(str)
        }
        return path
    },

    processFunction(indexedElement, str) {
        var date = utils.dateFromIso(indexedElement.getSord().XDateIso)
        if (!date) date = utils.getToday()

        if (str == "#DATE") {
            var df = new java.text.SimpleDateFormat("yyyy-MM-dd");
            return df.format(date);
        }
        else if (str == "#YEAR") {
            var df = new java.text.SimpleDateFormat("yyyy");
            return df.format(date);
        }
        else if (str == "#MONTH") {
            var df = new java.text.SimpleDateFormat("MM");
            return df.format(date);
        }
        else if (str == "#DAY") {
            var df = new java.text.SimpleDateFormat("dd");
            return df.format(date);
        }
        else if (str.startsWith("#FIRST")) {
            // Returns the first letter of the contents of the given field.
            var args = this.parseFunctionArguments(str, 1)
            var value = String(indexedElement.getObjKeyValue(args[0]))
            if (value.length >= 1) {
                return String(value.charAt(0).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
            }
            else {
                return "_"
            }
        }
        else {
            throw "BasicFiling error: {" + str + "} is not a special subfolder function."
        }
    },

    parseFunctionArguments(str, argumentCount) {
        var args = String(str.substring(str.indexOf('(') + 1, str.indexOf(')'))).split(",")
        //args.forEach(function (arg) { arg = arg*.*t*r*i*m*() }) 
        args.forEach(function (arg) { arg = arg })
        if (args.length != argumentCount) {
            throw "Incorrect argument count for " + str + ", requiring " + argumentCount + " arguments"
        }
        return args
    }
})