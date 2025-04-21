// CustomLocationController.js
// Version: 2.0.0
// Description: This script allows specifying the status of this Custom Location for Lens Studio.

// @ui {"widget":"label", "label":"Location State's drop down, allows you to see the"}
// @ui {"widget":"label", "label":"different states of Location in the Lens Studio."}
// @ui {"widget":"label", "label":"This allows you to design each state of the Lens."}
// @ui {"widget":"label", "label":""}
// @ui {"widget":"label", "label":"NOTE: This state selection only applies to Lens Studio's"}
// @ui {"widget":"label", "label":"preview. When using the Lens on device, it will"}
// @ui {"widget":"label", "label":"automatically switch between states."}
// @ui {"widget":"label", "label":""}
// @input int mode = 0 {"widget":"combobox", "values":[{"label":"Location Found", "value":0}, {"label":"Location Is Near", "value":1}, {"label":"Location Is Far", "value":2}, {"label":"Location Is Loading", "value":3}, {"label":"Location Failed To Load", "value":4}], "label":"Location State"}
