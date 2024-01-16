const model = new Bit.Things.ThreeDPrinting.Cups.CalmCup.CalmCupDto();
model.rotation = 180;
let previousMesh: BABYLON.Mesh;
let previousShape: Bit.Things.ThreeDPrinting.Cups.CalmCup.CalmCupData<Bit.Inputs.OCCT.TopoDSShapePointer>;
let panel: BABYLON.GUI.StackPanel;
let panelLoading: BABYLON.GUI.StackPanel;
let errorTextBlock: BABYLON.GUI.TextBlock;
let sv = new BABYLON.GUI.ScrollViewer

let computing = true;

const start = async () => {
    await disposePrevious();
    createGUI();
    await createShape(model);
    const opt = new Bit.Inputs.Draw.SceneDrawGridMeshDto();
    bitbybit.draw.drawGridMesh(opt);
    const skyboxOpt = new Bit.Inputs.BabylonScene.SkyboxDto();
    skyboxOpt.blur = 0.5;
    skyboxOpt.skybox = Bit.Inputs.Base.skyboxEnum.city;
    bitbybit.babylon.scene.enableSkybox(skyboxOpt);
    const lightOpt = new Bit.Inputs.BabylonScene.DirectionalLightDto();
    lightOpt.direction = [0, -100, -100];
    bitbybit.babylon.scene.drawDirectionalLight(lightOpt);
    const ground = await bitbybit.occt.shapes.face.createCircleFace({
        radius: 20,
        direction: [0, 1, 0],
        center: [0, 0, 0],
    });
    const groundDrawOpt = new Bit.Inputs.Draw.DrawOcctShapeSimpleOptions();
    groundDrawOpt.faceColour = "#f0b89d";
    bitbybit.draw.drawAnyAsync({
        entity: ground,
        options: groundDrawOpt
    });

    const cameraOpt = new Bit.Inputs.BabylonScene.CameraConfigurationDto();
    cameraOpt.lookAt = [0, 0, 0];
    cameraOpt.position = [0, 20, -30];
    bitbybit.babylon.scene.adjustActiveArcRotateCamera(cameraOpt);

}

start();

async function createShape(model: Bit.Things.ThreeDPrinting.Cups.CalmCup.CalmCupDto) {
    computing = true;
    enableLoadingIndicator();
    await disposePrevious();
    removeError();

    try {
        previousShape = await bitbybit.things.threeDPrinting.cups.calmCup.create(model);
        console.log(previousShape);
        if (previousShape) {
            previousMesh = await bitbybit.draw.drawAnyAsync({
                entity: previousShape
            });
        }
    } catch (ex) {
        addErrorToPanel(ex);
    }

    computing = false;
    disableLoadingIndicator();
}

function enableLoadingIndicator() {
    panel.isVisible = false;
    panelLoading.isVisible = true;
}

function disableLoadingIndicator() {
    panel.isVisible = true;
    panelLoading.isVisible = false;
}

async function disposePrevious() {
    if (previousMesh) {
        previousMesh.dispose();
        previousMesh = undefined;
    }
    if (previousShape) {
        await bitbybit.occt.cleanAllCache();
        previousShape = undefined;
    }
}

function addErrorToPanel(error: string) {

    if (errorTextBlock && sv) {
        errorTextBlock.text = error;
    } else {
        sv = new BABYLON.GUI.ScrollViewer("name");
        sv.height = "240px";
        sv.paddingTopInPixels = 10;
        sv.paddingLeftInPixels = 10;
        sv.paddingRightInPixels = 10;
        sv.paddingBottomInPixels = 10;

        errorTextBlock = new BABYLON.GUI.TextBlock("Error");
        errorTextBlock.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        errorTextBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        errorTextBlock.resizeToFit = true;
        errorTextBlock.fontSize = "30px";
        errorTextBlock.paddingTop = "20px";
        errorTextBlock.paddingLeft = "20px";
        errorTextBlock.paddingRight = "20px";
        errorTextBlock.paddingBottom = "20px";
        errorTextBlock.text = error;
        errorTextBlock.color = "#f0b89d";

        sv.addControl(errorTextBlock)

        panel.addControl(sv);
    }
}

function removeError() {
    if (sv && errorTextBlock) {
        panel.removeControl(sv);
        sv.dispose();
        errorTextBlock.dispose();
        sv = undefined;
        errorTextBlock = undefined;
    }
}

async function createGUI() {
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    panelLoading = new BABYLON.GUI.StackPanel();
    panelLoading.width = "620px";
    panelLoading.background = "#00000055";
    panelLoading.paddingRightInPixels = 40;
    panelLoading.paddingBottomInPixels = 40;
    panelLoading.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    panelLoading.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panelLoading.adaptHeightToChildren = true;
    panelLoading.isVisible = false;

    var headerLoading = new BABYLON.GUI.TextBlock("CALM CUP");
    headerLoading.text = "Computing CALM CUP...";
    headerLoading.height = "80px";
    headerLoading.color = "#f0b89d";
    headerLoading.fontSize = "30px"

    panelLoading.addControl(headerLoading);

    advancedTexture.addControl(panelLoading);

    panel = new BABYLON.GUI.StackPanel();
    panel.width = "620px";
    panel.background = "#00000055";
    panel.paddingRightInPixels = 40;
    panel.paddingBottomInPixels = 40;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.adaptHeightToChildren = true;
    advancedTexture.addControl(panel);

    var header1 = new BABYLON.GUI.TextBlock("CALM CUP");
    header1.text = "CALM CUP";
    header1.height = "80px";
    header1.color = "#f0b89d";
    header1.fontSize = "40px"

    panel.addControl(header1);

    createSliderWithLabel(panel, "Height:", model.height, 1, 20, 1, "height");
    createSliderWithLabel(panel, "Radius Bottom:", model.radiusBottom, 0.1, 10, 0.1, "radiusBottom");
    createSliderWithLabel(panel, "Radius Top Offset:", model.radiusTopOffset, 0.1, 10, 0.1, "radiusTopOffset");
    createSliderWithLabel(panel, "Thickness:", model.thickness, 0.1, 5, 0.01, "thickness");
    createSliderWithLabel(panel, "Fillet:", model.fillet, 0, 1, 0.01, "fillet");
    createSliderWithLabel(panel, "Handle Distance:", model.handleDist, 0.1, 5, 0.01, "handleDist");
    createSliderWithLabel(panel, "Nr. Handles:", model.nrOfHandles, 0, 2, 1, "nrOfHandles");

    var header = new BABYLON.GUI.TextBlock("Precision");
    header.paddingTopInPixels = 10;
    header.text = "Precision:";
    header.height = "60px";
    header.color = "white";
    header.fontSize = "20px";


    const gridPrecision = new BABYLON.GUI.Grid("Precision");
    gridPrecision.addColumnDefinition(0.5, false);
    gridPrecision.addColumnDefinition(0.5, false);
    gridPrecision.paddingTopInPixels = 30;
    gridPrecision.paddingLeftInPixels = 20;
    gridPrecision.paddingRightInPixels = 20;
    gridPrecision.height = "90px";

    var precisionInput = new BABYLON.GUI.InputText();
    precisionInput.paddingTop = 10;
    precisionInput.paddingLeft = 20;
    precisionInput.paddingRight = 20;
    precisionInput.fontSize = "20px";
    precisionInput.height = "70px";
    precisionInput.text = model.precision.toString();
    precisionInput.color = "white";
    precisionInput.width = 1;
    precisionInput.background = "#00000055";
    precisionInput.focusedBackground = "#00000088";

    precisionInput.onBlurObservable.add(() => {
        const val = +precisionInput.text;
        if (model.precision !== val) {
            model.precision = val;
            createShape(model);
        }
    });
    precisionInput.onBeforeKeyAddObservable.add((input) => {
        let key = input.currentKey;
        if (key < "0" || key > "9") {
            input.addKey = false;
        }
        if (key === ".") {
            input.addKey = true;
        }
    });

    gridPrecision.addControl(header, 0, 0);
    gridPrecision.addControl(precisionInput, 0, 1);

    panel.addControl(gridPrecision);

    const grid = new BABYLON.GUI.Grid("Actions");
    grid.addColumnDefinition(0.33, false);
    grid.addColumnDefinition(0.33, false);
    grid.addColumnDefinition(0.33, false);
    grid.paddingTopInPixels = 30;
    grid.height = "90px";

    const buttonSaveSTL = BABYLON.GUI.Button.CreateSimpleButton("STL", "STL");
    buttonSaveSTL.fontSize = "30px";
    buttonSaveSTL.paddingLeftInPixels = 20;
    buttonSaveSTL.paddingRightInPixels = 20;
    buttonSaveSTL.textBlock.color = "#ffffff";
    buttonSaveSTL.onPointerClickObservable.add(async () => {
        enableLoadingIndicator();
        try {
            await bitbybit.occt.io.saveShapeStl({
                shape: previousShape.compound,
                fileName: "calm-cup.stl",
                adjustYtoZ: false,
                precision: model.precision,
            });
        } catch (ex) {
            addErrorToPanel(ex);
        }
        disableLoadingIndicator();
    });


    const buttonSaveSTEP = BABYLON.GUI.Button.CreateSimpleButton("STL", "STEP");
    buttonSaveSTEP.fontSize = "30px";
    buttonSaveSTEP.paddingLeftInPixels = 20;
    buttonSaveSTEP.paddingRightInPixels = 20;
    buttonSaveSTEP.textBlock.color = "#ffffff";
    buttonSaveSTEP.onPointerClickObservable.add(async () => {
        enableLoadingIndicator();
        try {
            await bitbybit.occt.io.saveShapeSTEP({
                shape: previousShape.compound,
                fileName: "calm-cup.step",
                adjustYtoZ: false,
            });
        } catch (ex) {
            addErrorToPanel(ex);
        }
        disableLoadingIndicator();
    });

    const buttonSaveGLB = BABYLON.GUI.Button.CreateSimpleButton("STL", "GLB");
    buttonSaveGLB.fontSize = "30px";
    buttonSaveGLB.paddingLeftInPixels = 20;
    buttonSaveGLB.paddingRightInPixels = 20;
    buttonSaveGLB.textBlock.color = "#ffffff";
    buttonSaveGLB.onPointerClickObservable.add(async () => {
        enableLoadingIndicator();
        try {
            await bitbybit.babylon.io.exportGLB({
                fileName: "calm-cup.glb",
            })
        } catch (ex) {
            addErrorToPanel(ex);
        }
        disableLoadingIndicator();
    });

    grid.addControl(buttonSaveSTEP, 0, 0);
    grid.addControl(buttonSaveSTL, 0, 1);
    grid.addControl(buttonSaveGLB, 0, 2);
    panel.addControl(grid);


    var header2 = new BABYLON.GUI.TextBlock("bitbybit.dev");
    header2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    header2.text = "bitbybit.dev";
    header2.height = "120px";
    header2.color = "#f0b89d";
    header2.fontSize = "40px";


    panel.addControl(header2);
}

function createSliderWithLabel(
    panel: BABYLON.GUI.StackPanel,
    name: string,
    defaultVal: number,
    min: number,
    max: number,
    step: number,
    prop: string
) {
    var header = new BABYLON.GUI.TextBlock(name);
    header.paddingTopInPixels = 10;
    header.text = name + " " + defaultVal.toFixed(2);
    header.height = "50px";
    header.color = "white";
    header.fontSize = "20px"

    panel.addControl(header);

    var slider = new BABYLON.GUI.Slider(name);
    slider.thumbColor = "#f0b89d";
    slider.isThumbCircle = true;

    slider.borderColor = "#f0b89d"
    slider.minimum = min;
    slider.maximum = max;
    slider.step = step;
    slider.value = defaultVal;
    slider.paddingLeftInPixels = 10;
    slider.paddingRightInPixels = 10;
    slider.isVertical = false;
    slider.alpha = 1;

    slider.height = "15px";
    slider.onPointerUpObservable.add(() => {
        if (model[prop] !== slider.value) {
            header.text = name + " " + slider.value.toFixed(2);
            model[prop] = slider.value;
            if (!computing) {
                createShape(model);
            }
        }
    });

    slider.onValueChangedObservable.add(() => {
        header.text = name + " " + slider.value.toFixed(2);
    });

    panel.addControl(slider);
}
