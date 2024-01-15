<script lang="ts">
    // Import necessary modules
    import Button from "@smui/button";
    import Select, { Option } from "@smui/select";
    import { open } from "@tauri-apps/api/dialog";
    import { invoke } from "@tauri-apps/api/tauri";
    import { basename, sep } from "@tauri-apps/api/path";
    import Swal from "sweetalert2";
    import { downloadDirPathStore } from "../store";
    // Define constants and variables
    const positionOptions = ["左上", "左下", "右上", "右下"];
    let selectedPosition = positionOptions[0];
    let selectedPaths = [];
    let downloadDirectoryPath = "";
    let watermarkPath = "";
    const imageExtensions = ["JPEG", "PNG", "GIF", "BMP", "TIFF", "WebP"].map(
        (ext) => ext.toLowerCase(),
    );

    // Function to select images
    async function selectImages() {
        const res = await open({
            multiple: true,
            filters: [{ name: "Image", extensions: imageExtensions }],
        });
        if (Array.isArray(res)) {
            selectedPaths = res
        }
    }

    // Function to add watermark
    async function addWatermark(imgPath, watermarkPath, position, outputPath) {
        return new Promise((resolve, reject) => {
            invoke("add_watermark", {
                imgPath,
                watermarkPath,
                contrast: -5,
                scale: 0.05,
                position,
                outputPath,
            })
                .then((files) => {
                    resolve(files);
                })
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    // Function to start adding watermark to selected images
    async function startAddingWatermark(selectedPaths: string[]) {
        for (let index = 0; index < selectedPaths.length; index++) {
            const filePath = selectedPaths[index];
            let position = "";
            if (selectedPosition === "左上") {
                position = "TopLeft";
            } else if (selectedPosition === "左下") {
                position = "BottomLeft";
            } else if (selectedPosition === "右上") {
                position = "TopRight";
            } else if (selectedPosition === "右下") {
                position = "BottomRight";
            }
            const outputFile =
                downloadDirectoryPath + sep + (await basename(filePath));
            await addWatermark(filePath, watermarkPath, position, outputFile);
        }
    }

    // Initialize download directory path
    function initializeDownloadDirectory() {
        downloadDirPathStore.subscribe((value) => {
            downloadDirectoryPath = decodeURIComponent(value);
        });
    }

    // Function to select watermark image
    async function selectWatermark() {
        const data = await open({
            multiple: false,
            filters: [{ name: "Image", extensions: imageExtensions }],
        });
        if (typeof data === "string") {
            watermarkPath = data;
        }
    }

    // Function to start watermarking process
    async function startWatermarking() {
        if (!watermarkPath) {
            Swal.fire("请选择水印");
            return;
        }
        if (Array.isArray(selectedPaths) && selectedPaths.length) {
            await startAddingWatermark(selectedPaths);
            Swal.fire("添加成功");
        } else {
            Swal.fire("请选择图片");
        }
    }

    // Initialize the download directory path
    initializeDownloadDirectory();
</script>

<main>
    <div style="margin-top: 40px;" />
    <Button
        variant="raised"
        class="button-shaped-round"
        on:click={selectImages}
    >
        选择需要添加水印的图片
    </Button>
    <div style="margin-top: 20px;" />
    <Button
        variant="raised"
        class="button-shaped-round"
        on:click={selectWatermark}
    >
        选择水印
    </Button>
    <div style="margin-top: 20px;" />
    <div class="columns margins" style="justify-content: flex-start;">
        <div>
            <Select bind:value={selectedPosition} label="选择水印位置">
                {#each positionOptions as position}
                    <Option value={position}>{position}</Option>
                {/each}
            </Select>
        </div>
    </div>
    <div style="margin-top: 50px;" />
    <Button
        variant="raised"
        class="button-shaped-round"
        on:click={startWatermarking}
    >
        开始
    </Button>
    <div style="margin-top: 30px;" />
</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
    * :global(.demo-list) {
        max-width: 800px;
    }
</style>
