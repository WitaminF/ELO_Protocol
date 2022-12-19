//- Scripts créés par Steve Medina en 200?-2019 pour PROTOCOL SA: 
//    Scripts contenant la plupart des fonctions actuelles du PROTOPACK 
//    mais dans des fichiers trop complexes et peu ou pas commentés, 
//    difficilement utilisables par quelqu'un d'autre que l'auteur !
//- Modifiés par Guillaume Dufresne en 2020-2021 pour PROTOCOL SA : 
//    Principales fonctions isolées dans des scripts plus réduits 
//    pour plus de lisibilité et d'adaptation.
//- Modifié par Edgar Lucio le 13/10/2021 pour PROTOCOL SA: 
//    Suppression de quelques fonctions et commentaires redondants, 
//    corrections pour rendre l'exclusion d'users selon liste,si fournie, 
//    de nouveau fonctionnelle, ajout/modification commentaires.
//
// *******************************************************************************************************
// ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION //
// Ce fichier devrait être pleinement fonctionnel et n'a pas besoin d'être modifié !!
// ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION // ATTENTION //
// *******************************************************************************************************


//@include lib_Class

sol.define("proto.pack.jc.utils.GetUsers", {
    singleton: true,

    /**
     * Retourne la liste des noms d'utilisateurs actifs dont le nom 
     * NE FIGURE PAS dans la liste userExclusion du champ concerné (ex:VISAS, NOTIFICATION, ETC).
     * La liste userExclusion  se configure dans le fichier proto.config.json.
     */
    getUserNames(userExclusion) {
        let users = archive.getUserNames(true, false).toArray() // Get all user names
        let exclusionArray = userExclusion
        let userNameList = [] // Create a result array
		
		// Run throw all users
        users.forEach((user) => {
			// Check is this user in the exclusion
            if (exclusionArray.find(u => u == user.name)) {
                return
            }
			// If user isn't in the exclusion add it into result array
            userNameList.push(user.name)
        })
		
		// Return the result array
        return userNameList.sort()
    },

    /**
     * Retourne la liste des noms de tous les groupes existants.
     */
    getGroupNames() {
        let groups = archive.getUserNames(false, true).toArray() // Get all groups
        let groupNameList = [] // Create a result array

		// Run throw all groups
        groups.forEach((group) => {
			// Add group into the result array
            groupNameList.push(group.name)
        })
		
		// Return the sorted result
        return groupNameList.sort()
    },
    /**
     * Retire de la liste des groupes existants ceux dont le nom 
     * NE COMMENCE PAS par le préfixe du champ concerné (ex:VISAS, NOTIFICATION, ETC).
     * Le préfixe se configure dans le fichier proto.config.json.
     * 
     */
    getGroupNamesPrefix(prefix) {
        var groups = this.getGroupNames() // Get user groups

        return groups.filter(g => g.startsWith(prefix)) // Return only groups started with prefix
    },
})