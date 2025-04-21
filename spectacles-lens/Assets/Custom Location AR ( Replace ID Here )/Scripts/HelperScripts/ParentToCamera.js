
//@input string cameraName
/** @type {string} */
var cameraName = script.cameraName;

var cameraObj = findObjectWithName(cameraName);

if (!cameraObj){
    print("Error: Can't find main camera.")
    return;
}

script.getSceneObject().setParent(cameraObj);

/**
 * Returns the first SceneObject found with a matching name.
 * NOTE: This function recursively checks the entire scene and should not be used every frame.
 * It's recommended to only run this function once and store the result.
 * @param {string} objectName Object name to search for
 * @returns {SceneObject?} Found object (if any)
 */
function findObjectWithName(objectName) {
    var rootObjectCount = global.scene.getRootObjectsCount();
    var obj;
    var res;
    for (var i=0; i< rootObjectCount; i++) {
        obj = global.scene.getRootObject(i);
        if (obj.name == objectName) {
            return obj;
        }
        res = findChildObjectWithName(global.scene.getRootObject(i), objectName);
        if (res) {
            return res;
        }
    }
    return null;
}

/**
 * Searches through the children of `sceneObject` and returns the first child found with a matching name.
 * NOTE: This function recursively checks the entire child hierarchy and should not be used every frame.
 * It's recommended to only run this function once and store the result.
 * @param {SceneObject} sceneObject Parent object to search the children of
 * @param {string} childName Object name to search for
 * @returns {SceneObject?} Found object (if any)
 */
function findChildObjectWithName(sceneObject, childName) {
    var childCount = sceneObject.getChildrenCount();
    var child;
    var res;
    for (var i=0; i<childCount; i++) {
        child = sceneObject.getChild(i);
        if (child.name == childName) {
            return child;
        }
        res = findChildObjectWithName(child, childName);
        if (res) {
            return res;
        }
    }
    return null;
}