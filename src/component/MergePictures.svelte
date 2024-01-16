<script>
    // 引入 tauri 的 invoke API，用于调用 tauri 的文件选择接口
    import { open } from "@tauri-apps/api/dialog";
    import { readBinaryFile } from "@tauri-apps/api/fs";
    import { invoke } from "@tauri-apps/api/tauri";
    import { downloadDirPathStore } from "../store";
    import { sep } from "@tauri-apps/api/path";
    import Swal from "sweetalert2";
    import DownloadDirectory from './DownloadDirectoryPath.svelte';
    // 定义一个数组，用于存储用户上传的图片的 URL
    let images = [];
    let sourceFiles = [];
    let downloadDirectoryPath = "";

    // 定义一个函数，用于调用 tauri 的文件选择接口，获取用户选择的图片文件，并把它们转换成 URL，然后添加到 images 数组中
    async function selectImages() {
        // 调用 tauri 的 invoke API，传入一个指令名 'selectFiles'，以及一些选项，如允许多选，过滤文件类型等
        // 这个指令会打开一个文件选择对话框，让用户选择图片文件
        // 返回一个 promise，resolve 为一个包含用户选择的文件路径的数组
        const files = await open({
            multiple: true,
            filters: [
                {
                    name: "Image Files",
                    extensions: ["png", "jpg", "jpeg", "gif", "bmp"],
                },
            ],
        });

        // 遍历文件路径数组，把每个文件路径转换成一个 blob URL，并添加到 images 数组中
        for (const file of files) {
            const data = await readBinaryFile(file, { flag: "r" });

            // 创建一个 blob 对象，用于表示文件的二进制数据，指定文件的类型为 image
            const blob = new Blob([data], { type: "image/*" });

            // 使用 URL.createObjectURL 方法，把 blob 对象转换成一个 blob URL，用于在网页中显示图片
            const url = URL.createObjectURL(blob);

            images = [...images, url];
            sourceFiles = [...sourceFiles, file];
        }
    }

    // 定义一个函数，用于删除 images 数组中的指定索引的图片
    function deleteImage(index) {
        // 使用数组的 splice 方法，删除 images 数组中的指定索引的元素
        images.splice(index, 1);
        sourceFiles.splice(index, 1);

        // 重新赋值 images 数组，触发 svelte 的响应式更新
        images = images;
    }

    // 定义一个函数，用于交换 images 数组中的两个指定索引的图片
    function swapImages(index1, index2) {
        // 使用数组的解构赋值，交换 images 数组中的两个指定索引的元素
        [images[index1], images[index2]] = [images[index2], images[index1]];
        [sourceFiles[index1], sourceFiles[index2]] = [
            sourceFiles[index2],
            sourceFiles[index1],
        ];
        // 重新赋值 images 数组，触发 svelte 的响应式更新
        images = images;
        sourceFiles = sourceFiles;
    }

    function startMr() {
        if (sourceFiles.length < 2) {
            Swal.fire("请至少选择两张图片");
            return
        }
        invoke("merge_images", {
            paths: sourceFiles,
            maxImagesPerRow: 3,
            padding: 30,
            outputPath: downloadDirectoryPath + sep + new Date().getTime() + "-MR.jpg"
        })
            .then(() => {
                Swal.fire("合并成功");
            })
            .catch((err) => {
                console.error(err);
                Swal.fire("合并失败");
            });
    }
    function initializeDownloadDirectory() {
        downloadDirPathStore.subscribe((value) => {
            downloadDirectoryPath = decodeURIComponent(value);
        });
    }
    initializeDownloadDirectory()
</script>

<!-- 定义一个按钮，用于触发 selectImages 函数，让用户选择图片 -->
<button on:click={selectImages}>选择图片</button>
<button on:click={startMr}>开始合并</button>
<div class="image-out">
    {#each images as image, index}
        <div class="image-container">
            <!-- 显示图片，使用 blob URL 作为图片的 src 属性 -->
            <img class="image" src={image} alt="图片" />

            <!-- 定义一个按钮，用于触发 deleteImage 函数，删除当前图片 -->
            <button on:click={() => deleteImage(index)} class="del">删除</button
            >

            <!-- 定义一个按钮，用于触发 swapImages 函数，和前一个图片交换位置 -->
            <!-- 使用 svelte 的 if 指令，判断是否有前一个图片，如果没有，就不显示这个按钮 -->
            {#if index > 0}
                <button
                    class="move-front"
                    on:click={() => swapImages(index, index - 1)}>向前</button
                >
            {/if}

            <!-- 定义一个按钮，用于触发 swapImages 函数，和后一个图片交换位置 -->
            <!-- 使用 svelte 的 if 指令，判断是否有后一个图片，如果没有，就不显示这个按钮 -->
            {#if index !== images.length - 1}
                <button
                    class="move-after"
                    on:click={() => swapImages(index, index + 1)}>向后</button
                >
            {/if}
        </div>
    {/each}
</div>
<DownloadDirectory {downloadDirectoryPath} />
<!-- 使用 svelte 的 each 指令，遍历 images 数组，为每个图片创建一个图片容器 -->

<style>
    .image-out {
        width: 95%;
        display: flex;
        flex-wrap: wrap;
    }
    /* 定义一个样式类，用于设置图片的宽度和高度 */
    .image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    /* 定义一个样式类，用于设置图片容器的边框和内边距 */
    .image-container {
        position: relative;
        height: 250px;
        margin: 15px 15px;
        flex: 0 0 28%;
    }
    .image {
        position: absolute;
        width: 100%;
        height: 80%;
        left: 0px;
        top: 0px;
        background-size: 100% 100%;
    }

    .del {
        position: absolute;
        width: 25%;
        left: 0px;
        bottom: 0px;
    }
    .move-front {
        position: absolute;
        width: 25%;
        left: 35%;
        bottom: 0px;
    }
    .move-after {
        position: absolute;
        width: 25%;
        right: 0px;
        bottom: 0px;
    }
</style>
