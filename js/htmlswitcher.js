page = document.getElementById("page");

async function goPage(html_page, callback = function () { }) {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    elmnt = document.getElementById("page");
    /* Make an HTTP request using the attribute value as the file name: */
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                elmnt.innerHTML = this.responseText;
                page_items = document.getElementsByClassName("page-item");
                for (let i = 0; i < page_items.length; i++) {
                    page_items[i].classList.remove("active");
                }
                console.log("item-" + html_page);
                if (document.getElementById("item-" + html_page) !== null) {
                    document.getElementById("item-" + html_page).classList.add("active");
                }
                callback();
            }
            if (this.status == 404) {
                elmnt.innerHTML = "Page not found.";
            }
            /* Remove the attribute, and call this function once more: */
        }
    }
    xhttp.open("GET", html_page + ".html", true);
    xhttp.send();
    /* Exit the function: */
    return;
}