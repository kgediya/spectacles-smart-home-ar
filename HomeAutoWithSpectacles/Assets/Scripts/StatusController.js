// StatusUpdateController.js
// Version: 0.1.0
// Event: Lens Initialized
// Description: Control the UI status updates for each state of custom location detection

// @ui {"widget":"label", "label":"The Status Update Controller offers a few different ways"}
// @ui {"widget":"label", "label":"to help navigate users to the Custom Location."}
// @ui {"widget":"label", "label":""}

// @ui {"widget":"group_start","label":"Status Text"}
// @input string locationName {"label":"Location Name"}
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start","label":"Status Textures"}
// @input Asset.Texture locationGraphicsTexture {"label":"Location Icon"}
// @ui {"widget":"group_end"}
// @ui {"widget":"separator"}

// @ui {"widget":"label", "label":"Send Behavior Trigger allows you to send a"}
// @ui {"widget":"label", "label":"Custom Trigger to the Behavior Script for"}
// @ui {"widget":"label", "label":"setting up interactions."}
// @ui {"widget":"label", "label":"For more information visit Behavior's guide"}
// @ui {"widget":"label", "label":""}
// @input bool sendBehaviorTrigger
// @ui {"widget":"group_start","label":"Behavior Triggers", "showIf":"sendBehaviorTrigger"}
// @input string onLocationFound = "OnLocationFound"
// @input string onLocationLost = "OnLocationLost"
// @input string onDownloaded = "OnLocationDownloaded"
// @input string onDownloadFail = "OnLocationFailed"
// @ui {"widget":"group_end"}

// @ui {"widget":"separator"}
// @input bool advanced = false
// @input SceneObject locationContent {"showIf":"advanced"}
// @input Component.Text hintText {"showIf":"advanced"}
// @input Component.Script locationController {"showIf":"advanced"}
// @input Component.Image locationGraphics {"showIf":"advanced"}
// @input Component.Image hintAnimation {"showIf":"advanced"}
// @input Component.Image locationLoadingPreview {"showIf":"advanced"}
// @input SceneObject loadingRing {"showIf":"advanced"}
// @input SceneObject hintUI {"showIf":"advanced"}
// @input Asset.Texture goToHintTexture {"showIf":"advanced"}
// @input Asset.Texture pointAtHintTexture {"showIf":"advanced"}
// @input Asset.Texture failedTexture {"showIf":"advanced"}

if (!script.locationGraphicsTexture) {
    print("Please add reference to the `Preview Texture` field to the texture you want to show in the hint.");
}

// Editor modes.
const EDITOR_MODES = {
    LANDMARKER_FOUND: 0,
    LANDMARKER_IS_NEAR: 1,
    LANDMARKER_IS_FAR: 2,
    LANDMARKER_IS_LOADING: 3,
    LANDMARKER_FAILED_TO_LOAD: 4,
};

// Options
var warningHintDisplayTime = 3.0;

// States
var isEditor = global.deviceInfoSystem.isEditor();
var searchingForLocation = true;

var multipleLocations = {
    dltcCollection: [],
    locatedAtCollection: [],
};

for (var i = 0; i < global.scene.getRootObjectsCount(); i++) {
    var rootObject = global.scene.getRootObject(i);
    registerComponents(multipleLocations.dltcCollection, rootObject, "Component.DeviceLocationTrackingComponent");
    registerComponents(multipleLocations.locatedAtCollection, rootObject, "Component.LocatedAtComponent");
}

function registerComponents(collection, sceneObject, componentName) {
    sceneObject.getComponents(componentName).forEach(function(component) {
        collection.push(component);
    });
    for (var i = 0; i < sceneObject.getChildrenCount(); i++) {
        registerComponents(collection, sceneObject.getChild(i), componentName);
    }
}

function initialize() {
    // Assign the selected Landmarker image.
    script.locationGraphics.mainPass.baseTex = script.locationGraphicsTexture;
    script.locationLoadingPreview.mainPass.baseTex = script.locationGraphicsTexture;

    // Bind tracking data
    multipleLocations.dltcCollection.forEach(function(dltc) {
        dltc.onLocationFound = wrapFunction(dltc.onLocationFound, onLocationFound);
        dltc.onLocationLost = wrapFunction(dltc.onLocationLost, onLocationGotLost);
        dltc.onLocationDataDownloaded = wrapFunction(dltc.onLocationDataDownloaded, onLocationDataDownloaded);
        dltc.onLocationDataDownloadFailed = wrapFunction(dltc.onLocationDataDownloadFailed, onLocationDataFailed);
    });
    multipleLocations.locatedAtCollection.forEach(function(locatedAt) {
        locatedAt.onFound.add(onLocationFound);
        locatedAt.onLost.add(onLocationGotLost);
        locatedAt.onReady.add(onLocationDataDownloaded);
        locatedAt.onError.add(onLocationDataFailed);
    });

    // Set up initial state (content should start out hidden) and in a loading state.
    toggleContent(false);
    script.hintUI.enabled = false;
    script.hintText.text = "";  // The hint text is empty while loading.

    // Set up the Lens Studio editor debug mode.
    updateEditor();

    showPleaseBeAwareHint();
}

function showPleaseBeAwareHint() {
    print("Showing hint please be aware of your surroundings");
    if (isEditor) {
        // Show the hint UI directly since Lens Studio preview doesn't display the be aware hint.
        script.hintUI.enabled = true;
        return;
    }

    script.hintComponent = script.getSceneObject().createComponent("Component.HintsComponent");
    script.hintComponent.showHint("lens_hint_warning_please_be_aware_of_your_surroundings", warningHintDisplayTime);
    var event = script.createEvent("DelayedCallbackEvent");
    event.bind(function(eventData) {
        // We can now show the hint UI.
        script.hintUI.enabled = true;
    });
    event.reset(warningHintDisplayTime);
}

function hideHint() {
    global.tweenManager.startTween(script.hintUI, "transition_out");
}

function showGoToHint() {
    script.locationGraphics.enabled = true;
    script.hintAnimation.enabled = true;
    script.hintAnimation.mainPass.baseTex = script.goToHintTexture;
    setLocalizedHintText("@goTo");

    showActionHint();
}

function showPointAtHint() {
    script.locationGraphics.enabled = true;
    script.hintAnimation.enabled = true;
    script.hintAnimation.mainPass.baseTex = script.pointAtHintTexture;
    setLocalizedHintText("@pointAt");

    showActionHint();
}

function showLandmarkerFailed() {
    script.locationGraphics.enabled = false;
    script.hintAnimation.enabled = true;
    script.hintAnimation.mainPass.baseTex = script.failedTexture;
    setLocalizedHintText("@landmarkFailed");

    showActionHint();
}

function setLocalizedHintText(locKey) {
    script.hintText.text = locKey;
    var curText = script.hintText.text.toString();
    var finalText = curText.replace("{{Name}}", script.locationName);
    script.hintText.text = finalText;
}

function hideLoadingHint() {
    script.locationLoadingPreview.enabled = false;
    script.loadingRing.enabled = false;
}

function showActionHint() {
    script.hintText.enabled = true;
    global.tweenManager.startTween(script.hintUI, "hint_animation_in");
    global.tweenManager.startTween(script.hintUI, "hint_text_in");
    global.tweenManager.startTween(script.hintUI, "landmarker_graphics_in");
}

function onLocationFound() {
    if (script.sendBehaviorTrigger) {
        global.behaviorSystem.sendCustomTrigger(script.onLocationFound);
    }

    searchingForLocation = false;
    hideHint();

    toggleContent(true);
    // Add you own custom logic here when location found
}

function onLocationGotLost() {
    if (script.sendBehaviorTrigger) {
        global.behaviorSystem.sendCustomTrigger(script.onLocationLost);
    }

    searchingForLocation = true;
    showPointAtHint();

    toggleContent(false);
    // Add you own custom logic here when location lost
}

function onLocationDataDownloaded() {
    if (script.sendBehaviorTrigger && global.behaviorSystem) {
        global.behaviorSystem.sendCustomTrigger(script.onDownloaded);
    }

    if (isEditor && script.locationController.mode == EDITOR_MODES.LANDMARKER_IS_LOADING) {
        return;
    }

    hideLoadingHint();

    // Add you own custom logic here
}

function onLocationDataFailed() {
    if (script.sendBehaviorTrigger && global.behaviorSystem) {
        global.behaviorSystem.sendCustomTrigger(script.onDownloadFail);
    }

    searchingForLocation = false;

    hideLoadingHint();
    toggleContent(false);
    showLandmarkerFailed();

    // Add you own custom logic here when location data cannot be downloaded
}

function updateHintState() {
    if (global.scene.isRecording()) {
        script.hintUI.enabled = false;
        return;
    }

    if (!searchingForLocation || isEditor) {
        return;
    }

    var inRange = false;
    multipleLocations.dltcCollection.forEach(function(dltc) {
        if (dltc.locationProximityStatus == LocationProximityStatus.WithinRange) {
            inRange = true;
        }
    });
    multipleLocations.locatedAtCollection.forEach(function(locatedAt) {
        if (locatedAt.proximityStatus == LocationProximityStatus.WithinRange) {
            inRange = true;
        }
    });
    if (inRange) {
        showPointAtHint();
    } else {
        showGoToHint();
    }
}

function updateEditor() {
    // Making sure that edit mode is only available while working in Lens Studio
    if (!isEditor) {
        return;
    }

    switch (script.locationController.mode) {
        case EDITOR_MODES.LANDMARKER_FOUND:
            // If edit mode is set to when the landmarker is found
            onLocationDataDownloaded();
            onLocationFound();
            break;
        case EDITOR_MODES.LANDMARKER_IS_NEAR:
            // If edit mode is set to when the landmarker is near
            onLocationDataDownloaded();
            showPointAtHint();
            break;
        case EDITOR_MODES.LANDMARKER_IS_FAR:
            // If edit mode is set to when the landmarker is far
            onLocationDataDownloaded();
            showGoToHint();
            break;
        case EDITOR_MODES.LANDMARKER_IS_LOADING:
            // If edit mode is set to when the landmarker is loading
            break;
        case EDITOR_MODES.LANDMARKER_FAILED_TO_LOAD:
            // If edit mode is set to when the landmarker is failed to load
            onLocationDataFailed();
            break;
    }
}

function toggleContent(status) {
    script.locationContent.enabled = status;
}

function wrapFunction(origFunc, newFunc) {
    if (!origFunc) {
        return newFunc;
    }
    return function() {
        origFunc();
        newFunc();
    };
}

script.createEvent("UpdateEvent").bind(updateHintState);

script.createEvent("OnStartEvent").bind(initialize);
