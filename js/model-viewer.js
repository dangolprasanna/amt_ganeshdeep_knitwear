const modelViewer1 = document.getElementById("modelViewer1");
const modelViewer2 = document.getElementById("modelViewer2");

function hexToRgba(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];
    } else if (hex.length === 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }
    return [r / 255, g / 255, b / 255, 1];
}

function rgbStringToRgba(rgbString) {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return [1, 1, 1, 1];
    return [
        parseInt(match[1], 10) / 255,
        parseInt(match[2], 10) / 255,
        parseInt(match[3], 10) / 255,
        1
    ];
}

function applyMaterialChanges(modelViewer, colorValue) {
    if (!modelViewer || !modelViewer.model || !modelViewer.model.materials) {
        console.warn("Model not loaded yet, cannot change material.");
        return;
    }
    let rgbaColor;
    if (colorValue.startsWith('#')) {
        rgbaColor = hexToRgba(colorValue);
    } else if (colorValue.startsWith('rgb')) {
        rgbaColor = rgbStringToRgba(colorValue);
    } else {
        rgbaColor = [1, 1, 1, 1];
    }
    const materials = modelViewer.model.materials;
    if (modelViewer.id === "modelViewer2") {
        for (const material of materials) {
            if (material.pbrMetallicRoughness && material.name === "kain.001") {
                material.pbrMetallicRoughness.setBaseColorFactor(rgbaColor);
                material.pbrMetallicRoughness.setRoughnessFactor(0.8);
                material.pbrMetallicRoughness.setMetallicFactor(0.0);
            }
        }
    } else {
        for (const material of materials) {
            if (material.pbrMetallicRoughness) {
                material.pbrMetallicRoughness.setBaseColorFactor(rgbaColor);
                material.pbrMetallicRoughness.setRoughnessFactor(0.8);
                material.pbrMetallicRoughness.setMetallicFactor(0.0);
            }
        }
    }
}

function updateSweaterColor(colorValue) {
    applyMaterialChanges(modelViewer1, colorValue);
}

function updateShawlColor(colorValue) {
    applyMaterialChanges(modelViewer2, colorValue);
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#colorSwatchContainer1 .color-swatch').forEach(swatch => {
        swatch.addEventListener('click', function() {
            const rgb = this.getAttribute('data-color');
            updateSweaterColor(rgb);
            document.querySelectorAll('#colorSwatchContainer1 .color-swatch.active').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.querySelectorAll('#colorSwatchContainer2 .color-swatch').forEach(swatch => {
        swatch.addEventListener('click', function() {
            const rgb = this.getAttribute('data-color');
            updateShawlColor(rgb);
            document.querySelectorAll('#colorSwatchContainer2 .color-swatch.active').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
        });
    });
    if (modelViewer1) {
        modelViewer1.addEventListener("load", () => {
            const first = document.querySelector('#colorSwatchContainer1 .color-swatch');
            if (first) {
                first.classList.add('active');
                updateSweaterColor(first.getAttribute('data-color'));
            }
        });
    }
    if (modelViewer2) {
        modelViewer2.addEventListener("load", () => {
            const first = document.querySelector('#colorSwatchContainer2 .color-swatch');
            if (first) {
                first.classList.add('active');
                updateShawlColor(first.getAttribute('data-color'));
            }
        });
    }
});

export { updateSweaterColor, updateShawlColor }; 