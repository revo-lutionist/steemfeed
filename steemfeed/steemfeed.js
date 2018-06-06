document.addEventListener("DOMContentLoaded", () => {
    var arrPosts = JSON.parse(window.localStorage.getItem("posts"));
    var divOutput = document.getElementById("output");
    //var count = 0;

    for (var objPost of arrPosts) {
        objPost.image = objPost.image.replace(/\(/g, "\\(");
        objPost.image = objPost.image.replace(/\)/g, "\\)");
        //console.log(objPost.image);

        var divOuterContainer = document.createElement("div");
        var divImgContainer = document.createElement("div");
        var spanTitle = document.createElement("span");

        divOuterContainer.appendChild(divImgContainer);
        divOuterContainer.appendChild(spanTitle);
        divOutput.appendChild(divOuterContainer);

        divOuterContainer.classList.add("outerContainer");
        divImgContainer.classList.add("imgContainer");
        spanTitle.classList.add("title");

        divImgContainer.style.backgroundImage = "url(" + objPost.image + ")";
        spanTitle.innerHTML = "<a href='https://steemit.com" + objPost.url + "' target='_blank'> " + objPost.title;
    }
});