var axios = require('axios');
var auth = 'Basic YOU WISH'

migrate();

async function migrate() {
    let counter = 0;
    let data = await getArticlePage(0)
    while (data.size > 0) {
        for (const item of data.items) {
            await patchProductFlowExtraField(item);
            counter++
            console.log("PATCHED " + item.id + ", PATCHED SO FAR: " + counter + "|" + data.totalItems)
        }
        data = await getArticlePage(data.currentPage + 1)
    }
}

function getArticlePage(page) {
    return axios.get("https://app.robaws.be/api/v2/articles?include=extraFields&size=100&page=" + page, {
        headers: {
            'Authorization': auth
        }
    }).then(res => {
        return res.data;
    }).catch(function (error) {
        // handle error
        console.log(error);
    });
}

async function patchProductFlowExtraField(el) {
    if (el.id != null && (!el.extraFields.ProductFlow || el.extraFields.ProductFlow.booleanValue != true)) {
        await sleep(100);
        return await axios.patch("https://app.robaws.be/api/v2/articles/" + el.id, JSON.stringify({
            "extraFields": {
                "ProductFlow": {
                    "booleanValue": true
                }
            }
        }), {
            headers: {
                'Content-Type': 'application/merge-patch+json',
                'Authorization': auth
            }
        });
    }
}

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
