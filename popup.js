const POST_LIMIT = 40;

mArrTags = [];
mArrTagObjects = [];
mArrPosts = [];
mArrDisplayPosts = [];
mUser = "";

document.addEventListener("DOMContentLoaded", () => {
    //start loader
    document.getElementById("loader").style.display = "block";

    displayCategories();
});

function displayCategories() {
    var query = {
        tag: "",
        limit: POST_LIMIT,
        truncate_body: 1 
    };

    chrome.tabs.query({active:true,currentWindow:true}, (tab) => {
        var user = tab[0].url.split("@")[1];
        mUser = user;
        steem.api.getAccountsAsync([user])
        .then((result) => {
            query.tag = user; 
            steem.api.getDiscussionsByBlog(query, (err, res) => {
            mArrPosts = res;
            console.log(mArrPosts.lenth + " records returned");
            getTags(user, res);
            });    
        });
    }); 
}

function getTags(strUser, arrPosts) {
    var arrPostTags = [];

    for (var objRecord of arrPosts) {

        if (objRecord.author == strUser) {
            console.log("inside getTags, not a resteem.  Author: " + objRecord.author);
            arrPostTags = JSON.parse(objRecord.json_metadata).tags;

            for (var strTag of arrPostTags) {
                addTag(strTag);
            }
        } //If resteem (i.e. author != strUser), don't worry about tags
    }

    //sort the tag objects in mArrTagObjects via their count value.
    mArrTagObjects.sort(function(a,b){return b.count - a.count});

    //truncate array to top three tags
    if (mArrTagObjects.length > 2) {
        mArrTagObjects.length = 3;
    }

    //stop loader
    document.getElementById("loader").style.display = "none";
    
    if (mArrTagObjects.length == 3) {
        var btn1 = document.getElementById("btnTag1");
        var btn2 = document.getElementById("btnTag2");
        var btn3 = document.getElementById("btnTag3");
        var btnResteems = document.getElementById("btnResteems");
        
        btn1.value = capitalizeFirstLetter(mArrTagObjects[0].name);
        btn2.value = capitalizeFirstLetter(mArrTagObjects[1].name);
        btn3.value = capitalizeFirstLetter(mArrTagObjects[2].name);
        btnResteems.value = "Resteems";

        btn1.setAttribute("data-tag", mArrTagObjects[0].name);
        btn2.setAttribute("data-tag", mArrTagObjects[1].name);
        btn3.setAttribute("data-tag", mArrTagObjects[2].name);
        btnResteems.setAttribute("data-tag", "resteems");

        btn1.addEventListener("click", displayPosts);
        btn2.addEventListener("click", displayPosts);
        btn3.addEventListener("click", displayPosts);
        btnResteems.addEventListener("click", displayPosts);

        btn1.style.display = "inline-block";
        btn2.style.display = "inline-block";
        btn3.style.display = "inline-block";
        btnResteems.style.display = "inline-block";

    }
    else {
        //not enough tags to use ***Nb, can add code to handle 2 tags here.
        document.getElementById("popup").innerHTML = "Not enough tags";
    }
    
}

function addTag(str) {
    var blnNew = true;

    if (mArrTags.length == 0) {
        mArrTags.push(str);
        mArrTagObjects.push( {name:str, count:1} );
    }
    else {
        for (var strTag of mArrTags) {
            if (strTag == str) {
                //tag already in tag array, so increment the count in the relevant tag object (held in mArrTagObjects)
                for (var objTag of mArrTagObjects) {
                    if (objTag.name == str) {
                        objTag.count += 1;
                    }
                }
                blnNew = false;
                break;
            }
        }
        if (blnNew) {
            //tag not in tag array, so add it with count of 1
            mArrTagObjects.push( {name:str, count:1} );
            mArrTags.push(str);
        }
    }
}

function displayPosts() {
    var arrPostTags = [];
    var strTag = this.getAttribute("data-tag");
    console.log(strTag);

    if (strTag == "resteems") {
        for (var objPost of mArrPosts) {
            if (objPost.author != mUser) {  //i.e. a resteem
                //add post to output
                var objSummary = createSummary(objPost);
                mArrDisplayPosts.push(objSummary);
            }
        }
    } 
    else {  //i.e. not a resteem
        for (var objPost of mArrPosts) {
            arrPostTags = JSON.parse(objPost.json_metadata).tags;
            if (objPost.author == mUser && arrPostTags.includes(strTag)) {
                //add post to output
                var objSummary = createSummary(objPost);
                mArrDisplayPosts.push(objSummary);
            }
        }
    }

    window.localStorage.setItem("posts", JSON.stringify(mArrDisplayPosts));

    //create tab, navigate to page in extension for display
    var creating = chrome.tabs.create({
        url:"/steemfeed/steemfeed.html"
    });
}

function createSummary(post) {
    var img = "";

    if (JSON.parse(post.json_metadata).image) {
        img = JSON.parse(post.json_metadata).image[0];
    }
    var ttl = post.root_title;
    var authr = post.author;
    var link = post.url;
    //code here for votes, value, resteems etc

    return { image: img, title: ttl, author: authr, url: link };
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}