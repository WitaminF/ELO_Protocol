//@include lib_Class


/**
 * Classe parente de toutes les fonctions du pack.
 * Définit les évènements possibles auxquels les fonctions aux accès.
 * Les fonctions restent `undefined` et ne sont pas lancées si elles ne sont pas implémentées.
 * Voir le commentaire après la fonction non définie pour l'implémentation.
 * 
 * Informations pour de développement d'une fonctionnalité :
 * - Créer un exemple de configuration tout en haut du fichier pour que la personne qui crée une configuration puisse facilement voir quoi remplir.
 * - Ne pas changer les champs de configuration requis après avoir déjà installé la fonctionnalité chez un client. Si elle change, il faudra donc changer la configuration aussi.
 *   - S'il faut ajouter un nouveau champ, il faudra lui donner une valeur par défaut.
 * - Ne jamais utiliser les variables globales dans les fonctions d'une fonctionnalité, toujours utiliser l'argument passé à la fonction.
 *   - Ne pas utiliser la générale `indexDialog` mais l'argument `onNameExit(id); id.getName()`, par exemple
 * - Ne pas oublier d'ajouter la fonctionnalité à `ImportAllFunctions.js` pour qu'elles soient utilisables.
 */
 
 /**
 * Description in English
 * This script is an interface script
 * It implements into child scripts to define possible methods inside
 */
 
sol.define("proto.pack.jc.PackFunction", {
    /**
     * Appelé pour initialiser les fonction.
     * @param {IndexDialogAdapter} indexDialog 
     */
    onInit: undefined, //onInit: function (indexDialog) { },

    /**
     * Appelé lorsque l'utilisateur modifie le nom.
     * Le nom peut être récupéré avec `indexDialog.getName()`.
     * @param {IndexDialogAdapter} indexDialog
     */
    onNameExit: undefined, //onNameExit: function (indexDialog) { },
    /**
     * Appelé lorsque l'utilisateur modifie la date.
     * La date peut être récupérée avec `indexDialog.getXDate()`.
     * @param {IndexDialogAdapter} indexDialog 
     */
    onDateExit: undefined, //onDateExit: function (indexDialog) { },
    /**
     * Appelé lorsque l'utilisateur modifie un champ.
     * La valuer du champe peut être récupérée avec `indexDialog.getObjKeyValue(fieldName)`.
     * @param {IndexDialogAdapter} indexDialog 
     * @param {String} fieldName Le nom du champ modifié.
     */
    onFieldExit: undefined, //onFieldExit: function (indexDialog, fieldName) { },
    
    /**
     * Appelé lorsque l'utilisateur clique OK pour un document qui n'est pas dans l'archive.
     * Le document peut être inséré dans l'archive en appelant le paramètre `insertFunction`. Par exemple:  insertFunction(0, "1.0", "Première version")
     * @param {IndexDialogAdapter} indexDialog 
     * @param {Function<int, String, String>} insertFunction La fonction d'insertion du document: insertIntoArchive(int parentId, String version, String comment)
     */
    onInsert: undefined, //onInsert: function (indexDialog, insertFunction) { },
    /**
     * Appelé lorsque l'utilisateur clique OK pour un document dans l'archive ou après qu'un nouveau document soit inséré dans l'archive.
     * Le paramètre `id` peut être utilisé pour appeler des fonctions qui demandent qu'un document doit dans l'archive.
     * @param {IndexDialogAdapter} indexDialog 
     * @param {Number} id L'identifiant du document.
     */
    onFinish: undefined, //onFinish: function (indexDialog, id) { },
})