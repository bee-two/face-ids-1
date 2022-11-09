//var q=require("q")
//var mysql=require("../common/database").pool;
const puppeteer = require("puppeteer");
// const q = require('q');
const user_ppt = require("./user_ppt");
var browser;
var page;
const DelayTimes = 2000;
const RandomDelayTimes = 1000;
//const { async } = require('q');
async function launchPuppeteer() {
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--ignore-certificate-errors",
        "--allow-running-insecure-content",
        "--enable-features=NetworkService",
        "--disable-speech-api", // 	Disables the Web Speech API (both speech recognition and synthesis)
        "--disable-background-networking", // Disable several subsystems which run network requests in the background. This is for use 									  // when doing network performance testing to avoid noise in the measurements. ↪
        "--disable-background-timer-throttling", // Disable task throttling of timer tasks from background pages. ↪
        "--disable-backgrounding-occluded-windows",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-component-update",
        "--disable-default-apps",
        "--disable-dev-shm-usage",
        "--disable-domain-reliability",
        "--disable-extensions",
        "--disable-features=AudioServiceOutOfProcess",
        "--disable-hang-monitor",
        "--disable-ipc-flooding-protection",
        "--disable-notifications",
        "--disable-offer-store-unmasked-wallet-cards",
        "--disable-popup-blocking",
        "--disable-print-preview",
        "--disable-prompt-on-repost",
        "--disable-renderer-backgrounding",
        "--disable-setuid-sandbox",
        "--disable-sync",
        "--hide-scrollbars",
        "--ignore-gpu-blacklist",
        "--metrics-recording-only",
        "--mute-audio",
        "--no-default-browser-check",
        "--no-first-run",
        "--no-pings",
        "--no-sandbox",
        "--no--zygote",
        "--password-store=basic",
        "--use-gl=swiftshader",
        "--use-mock-keychain",
      ],
      ignoreHTTPSErrors: true,
    });
    //                '--single-process',
    page = await browser.newPage();
    // tắt Cache
    await page.setCacheEnabled(false);
    // Tắt một số dữ liệu không cần thiết
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.resourceType() === "image") {
        request.abort();
      } else {
        request.continue();
      }
    });
    console.log("start browser");
    //page.setDefaultNavigationTimeout(15000);
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
    );
    await page.setViewport({ width: 1700, height: 500 });
    return true;
  } catch (err) {
    // Crawling failed...
    console.log(err);
    return false;
  }
}

async function closePuppeteer() {
  try {
    if (browser) {
      await browser.close();
      console.log("stop browser");
    }
    return true;
  } catch (err) {
    // Crawling failed...
    //console.log(err)
    return false;
  }
}
async function loginfacebookwithUser(userfb, passfb) {
  try {
    await page.goto("https://www.facebook.com/", {
      waitUntil: "networkidle2",
      timeout: 0,
    });
    console.log("Goto link FB");
    var btnAccess = await page.evaluate(() => {
      var btn = document.querySelector(
        'button[data-cookiebanner="accept_button"]'
      );
      if (btn !== undefined && btn !== null && btn !== []) {
        return true;
      }
      return false;
    });
    console.log("btnAccess: ", btnAccess);
    if (btnAccess === true) {
      await page.waitForXPath(
        '//button[@data-cookiebanner="accept_button"]',
        2000
      );
      await page.click('button[data-cookiebanner="accept_button"]');
      console.log("Active btn success");
    }
    await page.waitForXPath('//input[@id="email"]', 3000);
    await page.type('input[id="email"]', userfb, {
      delay: 100 + Math.random() * 100,
    });
    await page.waitForXPath('//input[@id="pass"]', 1000);
    await page.type('input[id="pass"]', passfb, {
      delay: 100 + Math.random() * 100,
    });
    await page.click('button[name="login"]');
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    var fbtitle = await page.title();
    console.log("Fb title: " + fbtitle);
    if (
      fbtitle === "Đăng nhập Facebook" ||
      fbtitle.indexOf("Đăng nhập Facebook") >= 0 ||
      fbtitle === "Log in to Facebook" ||
      fbtitle.indexOf("Log in to Facebook") >= 0
    ) {
      var delUser = await user_ppt.deleteUser(userfb);
      console.log(
        "Fb title: " +
          fbtitle +
          ": " +
          userfb +
          " login fail. Deleted: " +
          delUser
      );
      return false;
    }
    var cookies = await page.cookies();
    var user = {
      user_name: userfb,
      password: passfb,
      cookies: JSON.stringify(cookies),
    };
    const getfb = await user_ppt.getAcoutFbbyEmail(userfb);
    if (getfb[0] && getfb[0] != undefined) {
      var numb;
      if (getfb[0].number_login == null) {
        numb = 1;
      } else {
        numb = getfb[0].number_login;
      }
      user.number_login = numb + 1;
      const updatefbCookies = await user_ppt.updateCookiebyEmail(
        user.cookies,
        user.user_name,
        user.number_login
      );
      console.log("update Cookies: " + user.user_name);
    } else {
      user.number_login = 1;
      const addnew = await user_ppt.addAcoutFb(user);
      console.log("new Cookies: " + user.user_name);
    }
    return true;
  } catch (err) {
    // Crawling failed...
    console.log(err);
    return false;
  }
}
async function loginwebFBwithCookie() {
  try {
    const accoutFB = await user_ppt.getCookies();
    if (accoutFB[0] && accoutFB[0] != null && accoutFB[0] != undefined) {
      await user_ppt.updateNumberLoginbyEmail(
        accoutFB[0].number_login + 1,
        accoutFB[0].user_name
      );
      await page.goto("https://www.facebook.com/", {
        waitUntil: "networkidle2",
        timeout: 0,
      });
      const btnAccess = page.evaluate(() => {
        const btn = document.querySelector(
          'button[data-cookiebanner="accept_button"]'
        );
        if (btn !== undefined && btn !== null && btn !== []) {
          return true;
        }
        return false;
      });
      if (btnAccess === true) {
        await page.waitForXPath(
          '//button[@data-cookiebanner="accept_button"]',
          2000
        );
        await page.click('button[data-cookiebanner="accept_button"]');
      }
      await page.setCookie(...JSON.parse(accoutFB[0].cookies));
      await page.goto("https://www.facebook.com/", {
        waitUntil: "networkidle2",
        timeout: 0,
      });
      const title = await page.title();
      console.log("title: ", title);
      if (
        title !== "Facebook" &&
        title.slice(title.length - 10, title.length) !== ") Facebook"
      ) {
        const deleteFB = await user_ppt.deleteUser(accoutFB[0].user_name);
        console.log("Deleted a User!");
        return 2;
        //return false;
      }
      console.log("Logined with Cookie!");
      return true;
    } else {
      console.log("Login fail! Not find account FB.");
      return false;
    }
  } catch (err) {
    // Crawling failed...
    console.log(err);
    return false;
  }
}
async function getfacebookUID(link0, type) {
  try {
    if (link0.indexOf("http") >= 0 || link0.indexOf(".com") >= 0) {
      var link = link0;
    } else {
      var link = "https://www.facebook.com/" + link0;
    }
    //console.log('link UID is: ' + link);
    await page.setViewport({ width: 1700, height: 300 });
    await page.goto(link, { waitUntil: "networkidle2", timeout: 0 });
    var source = await page.content();
    var id = false;
    var type_fb = false;
    var f = await source.split('"userID":"')[1];
    var p = await source.split('"pageID":"')[1];
    var g = await source.split('"groupID":"')[1];
    //console.log(source,f,p,g);
    if (f && f.indexOf('"')) {
      id = f.split('"')[0];
      type_fb = "userID";
    }
    if (p && p.indexOf('"')) {
      id = p.split('"')[0];
      type_fb = "pageID";
    }
    if (g && g.indexOf('"')) {
      id = g.split('"')[0];
      type_fb = "groupID";
    }
    // If user is not found, id would be `false`
    if (id == false) {
      console.log("Không tìm thấy người dùng: " + link);
      return false;
    } else {
      console.log(type_fb, ": ", id);
      var id0 = new Array();
      if (type === true) {
        id0[0] = new Array(id, type_fb);
      } else {
        id0[0] = new Array(id);
      }
      console.log("UID is: ", id0);
      return id0;
    }
  } catch (err) {
    // Crawling failed...
    console.log(err);
    return false;
  }
}
async function getLinkVideoFB(textlink) {
  try {
    if (textlink == null || textlink == undefined || textlink == "")
      return false;
    if (
      textlink.indexOf("https://") < 0 &&
      textlink.indexOf("http://") < 0 &&
      textlink.indexOf(".com/") < 0
    ) {
      textlink = "https://wwww.facebook.com/" + textlink;
    }
    if (textlink.indexOf("://m.") > 0) {
      textlink = textlink.replace("://m.", "://www.");
    }
    await page.setViewport({ width: 1700, height: 500 });
    await page.goto(textlink, { waitUntil: "networkidle2", timeout: 0 });
    let bodyHTML = await page.content();
    console.log("textlink: ", textlink);
    var linkVid = "";
    if (bodyHTML.indexOf('playable_url_quality_hd":"') > 0) {
      //console.log(bodyHTML);
      linkVid =
        (await bodyHTML
          .split('playable_url_quality_hd":"')[1]
          .split('"')[0]
          .replaceAll("\\u0025", "%")
          .replaceAll("\\", "")) + "&dl=1";
    } else if (bodyHTML.indexOf('playable_url":"') > 0) {
      linkVid =
        (await bodyHTML
          .split('playable_url":"')[1]
          .split('"')[0]
          .replaceAll("\\u0025", "%")
          .replaceAll("\\", "")) + "&dl=1";
    } else {
      console.log("Not find playable_url");
      return false;
    }

    if (
      linkVid == null ||
      linkVid == undefined ||
      linkVid == "" ||
      linkVid == false
    )
      return false;
    console.log("linkVideo: " + linkVid);
    return linkVid;
  } catch (err) {
    // Crawling failed...
    console.log(err);
    return false;
  }
}
async function getFriendsFb(uid) {
  if (uid) {
    try {
      await page.setViewport({ width: 1700, height: 10000 });
      await page.goto(
        "https://www.facebook.com/profile.php?id=" + uid + "&sk=friends",
        { waitUntil: "networkidle2", timeout: 0 }
      );
      //await autoScroll(page);
      var href = await page.evaluate(async () => {
        var href0 = [];
        await new Promise((resolve, reject) => {
          var numb = 0;
          var textSelector =
            'body>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>a[role="link"]';
          var timer = setInterval(() => {
            let divHref0 = document.querySelectorAll(textSelector);
            if (
              document.querySelectorAll(textSelector)[0] != undefined &&
              document.querySelectorAll(textSelector)[0] != "" &&
              document
                .querySelectorAll(textSelector)[0]
                .getAttribute("href")
                .indexOf("friends/") >= 0
            ) {
              var divHref = document.querySelectorAll(textSelector)[1];
            } else {
              var divHref = document.querySelectorAll(textSelector)[0];
            }
            if (
              divHref != null &&
              divHref != false &&
              divHref != "" &&
              divHref != [] &&
              divHref != undefined &&
              divHref.textContent != undefined &&
              divHref.textContent != ""
            ) {
              //let href1=divHref.getAttribute('href');
              href0.push([divHref.getAttribute("href"), divHref.textContent]);
              divHref.parentElement.parentElement.parentElement.remove(); //xóa thẻ div giảm dung lượng
              numb = 0; //console.log(href1);
            }
            if (
              divHref0[divHref0.length - 1] != undefined &&
              divHref0.length > 1 &&
              divHref0[divHref0.length - 1].textContent == ""
            ) {
              numb++;
            }
            if (
              divHref == null ||
              divHref == false ||
              divHref == "" ||
              divHref == [] ||
              divHref == undefined ||
              numb >= 20
            ) {
              clearInterval(timer);
              resolve(); //console.log(href0);
            }
            divHref = "";
          }, 200 + Math.random() * 100);
        });
        return href0;
      });
      //console.log(href);
      var output = new Array();
      if (href != "" && href != [] && href != undefined) {
        for (var i = 0; i < href.length; i++) {
          output[i] = new Array(...href[i]);
          href[i] = [];
        }
        href = [];
      }

      return output;
    } catch (err) {
      // Crawling failed...
      console.log(err);
      return false;
    }
  }
  return false;
}
async function getfollowingFb(uid) {
  if (uid) {
    try {
      await page.setViewport({ width: 1700, height: 10000 });
      await page.goto(
        "https://www.facebook.com/profile.php?id=" + uid + "&sk=following",
        { waitUntil: "networkidle2", timeout: 0 }
      );
      //await autoScroll(page);
      var link = await page.evaluate(async () => {
        // click vào nút folow
        var btnfolow = document.querySelectorAll('a[href*="follow"]')[0];
        if (
          btnfolow != undefined &&
          btnfolow != "" &&
          btnfolow != [] &&
          btnfolow != false
        ) {
          //await btnfolow.click();
          return btnfolow.getAttribute("href");
        } else {
          return false;
        }
      });
      if (link != false && link != undefined && link != "") {
        await page.goto(link, { waitUntil: "networkidle2", timeout: 0 });
      }
      var href = await page.evaluate(async () => {
        var href0 = [];
        await new Promise((resolve, reject) => {
          var numb = 0;
          var textSelector =
            'body>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>a[role="link"]';
          var timer = setInterval(() => {
            //console.log('start scan')
            let divHref0 = document.querySelectorAll(textSelector);
            if (
              document.querySelectorAll(textSelector)[0] != undefined &&
              document.querySelectorAll(textSelector)[0] != "" &&
              document
                .querySelectorAll(textSelector)[0]
                .getAttribute("href")
                .indexOf("friends/") >= 0
            ) {
              var divHref = document.querySelectorAll(textSelector)[1];
            } else {
              var divHref = document.querySelectorAll(textSelector)[0];
            }

            if (
              divHref != null &&
              divHref != false &&
              divHref != "" &&
              divHref != [] &&
              divHref != undefined &&
              divHref.textContent != undefined &&
              divHref.textContent != ""
            ) {
              //let href1=divHref.getAttribute('href');
              href0.push([divHref.getAttribute("href"), divHref.textContent]);
              divHref.parentElement.parentElement.parentElement.remove(); //xóa thẻ div giảm dung lượng
              numb = 0; //console.log(href1);
            }
            if (
              divHref0[divHref0.length - 1] != undefined &&
              divHref0.length > 0 &&
              divHref0[divHref0.length - 1].textContent == ""
            ) {
              numb++;
            }
            if (
              divHref == null ||
              divHref == false ||
              divHref == "" ||
              divHref == [] ||
              divHref == undefined ||
              numb >= 20
            ) {
              clearInterval(timer);
              resolve(); //console.log(href0);
            }
            divHref = "";
          }, 200 + Math.random() * 100);
        });
        return href0;
      });
      var output = new Array();
      if (href != "" && href != [] && href != undefined) {
        for (var i = 0; i < href.length; i++) {
          output[i] = new Array(...href[i]);
          href[i] = [];
        }
        href = [];
      }
      return output;
    } catch (err) {
      // Crawling failed...
      console.log(err);
      return false;
    }
  }
  return false;
}
async function getMembersGroup(uid) {
  if (uid) {
    try {
      await page.setViewport({ width: 1700, height: 10000 });
      //await autoScroll(page);
      var output = new Array();
      // lấy Admin
      await page.goto(
        "https://www.facebook.com/groups/" + uid + "/members/admins",
        { waitUntil: "networkidle2", timeout: 0 }
      );
      var href1 = await page.evaluate(async () => {
        var href0 = [];
        await new Promise((resolve, reject) => {
          var numb1 = 0;
          var numb2 = 0;
          var textSelectorHref = 'div>span>span>span>a[role="link"]';
          var textSelectorNotDel =
            "div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>a";
          var timer = setInterval(() => {
            let divHref0 = document.querySelectorAll(textSelectorHref);
            for (let i = 0; i < divHref0.length; i++) {
              if (
                divHref0[i] &&
                divHref0[i].textContent != "" &&
                divHref0[i].getAttribute("href").length > 20
              ) {
                var divHref = divHref0[i];
                break;
              }
            }
            let divNotDel0 = document.querySelectorAll(textSelectorNotDel);
            for (let i = 0; i < divNotDel0.length; i++) {
              if (
                divNotDel0[i] &&
                divNotDel0[i].textContent != "" &&
                divNotDel0[i].getAttribute("href").length > 20
              ) {
                var divNotDel = divNotDel0[i];
                break;
              }
            }
            if (
              divHref != null &&
              divHref != false &&
              divHref != "" &&
              divHref != [] &&
              divHref != undefined &&
              divHref.textContent != undefined &&
              divHref.textContent != ""
            ) {
              //let href1=divHref.getAttribute('href').split('/')[4];
              href0.push([
                divHref.getAttribute("href").split("/")[4],
                divHref.textContent,
              ]);
              divHref.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //xóa thẻ div giảm dung lượng
              numb1 = 0; //console.log(href1);
            }
            if (
              divHref0 != null &&
              divHref0 != false &&
              divHref0 != "" &&
              divHref0 != [] &&
              divHref0 != undefined &&
              divHref0[divHref0.length - 1] != undefined
            ) {
              if (
                divHref0[divHref0.length - 1] != undefined &&
                divHref0[divHref0.length - 1].textContent == ""
              ) {
                numb1++;
              }
            }
            if (
              divNotDel != null &&
              divNotDel != false &&
              divNotDel != "" &&
              divNotDel != [] &&
              divNotDel != undefined &&
              divNotDel.parentElement.parentElement.parentElement.childNodes[1]
                .firstChild.firstChild.firstChild.firstChild
            ) {
              //let href2=divNotDel.getAttribute('href').split('/')[4];
              href0.push([
                divNotDel.getAttribute("href").split("/")[4],
                divNotDel.parentElement.parentElement.parentElement
                  .childNodes[1].firstChild.firstChild.firstChild.firstChild
                  .textContent,
              ]);
              divNotDel.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //xóa thẻ div giảm dung lượng
              numb2 = 0; //console.log(href1);
            }
            if (
              divNotDel0 != null &&
              divNotDel0 != false &&
              divNotDel0 != "" &&
              divNotDel0 != [] &&
              divNotDel0 != undefined &&
              divNotDel0[divNotDel0.length - 1] != undefined
            ) {
              if (
                divNotDel0[divNotDel0.length - 1].parentElement.parentElement
                  .parentElement != undefined &&
                divNotDel0[divNotDel0.length - 1].parentElement.parentElement
                  .parentElement.textContent == ""
              ) {
                numb2++;
              }
            }
            if (
              ((divHref == null ||
                divHref == false ||
                divHref == "" ||
                divHref == [] ||
                divHref == undefined) &&
                (divNotDel == null ||
                  divNotDel == false ||
                  divNotDel == "" ||
                  divNotDel == [] ||
                  divNotDel == undefined)) ||
              (numb1 >= 20 && numb2 >= 20)
            ) {
              clearInterval(timer);
              resolve(); //console.log(href0);
            }
            divHref = "";
            divNotDel = "";
          }, 200 + Math.random() * 100);
        });
        return href0;
      });
      //console.log(href);
      if (href1 != "" && href1 != [] && href1 != undefined) {
        for (var i = 0; i < href1.length; i++) {
          output[i] = new Array(...href1[i], "admin");
          href1[i] = [];
        }
        href1 = [];
      }
      // lấy thành viên thông thường (có thể có admin)
      await page.goto("https://www.facebook.com/groups/" + uid + "/members", {
        waitUntil: "networkidle2",
        timeout: 0,
      });
      var href = await page.evaluate(async () => {
        var href0 = [];
        await new Promise((resolve, reject) => {
          var numb1 = 0;
          var numb2 = 0;
          var textSelectorHref = 'div>span>span>span>a[role="link"]';
          var textSelectorNotDel =
            "div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>a";
          var timer = setInterval(() => {
            let divHref0 = document.querySelectorAll(textSelectorHref);
            for (let i = 0; i < divHref0.length; i++) {
              if (
                divHref0[i] &&
                divHref0[i].textContent != "" &&
                divHref0[i].getAttribute("href").length > 20
              ) {
                var divHref = divHref0[i];
                break;
              }
            }
            let divNotDel0 = document.querySelectorAll(textSelectorNotDel);
            for (let i = 0; i < divNotDel0.length; i++) {
              if (
                divNotDel0[i] &&
                divNotDel0[i].textContent != "" &&
                divNotDel0[i].getAttribute("href").length > 20
              ) {
                var divNotDel = divNotDel0[i];
                break;
              }
            }
            if (
              divHref != null &&
              divHref != false &&
              divHref != "" &&
              divHref != [] &&
              divHref != undefined &&
              divHref.textContent != undefined &&
              divHref.textContent != ""
            ) {
              //let href1=divHref.getAttribute('href').split('/')[4];
              href0.push([
                divHref.getAttribute("href").split("/")[4],
                divHref.textContent,
              ]);
              divHref.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //xóa thẻ div giảm dung lượng
              numb1 = 0; //console.log(href1);
            }
            if (
              divHref0 != null &&
              divHref0 != false &&
              divHref0 != "" &&
              divHref0 != [] &&
              divHref0 != undefined &&
              divHref0[divHref0.length - 1] != undefined
            ) {
              if (
                divHref0[divHref0.length - 1] != undefined &&
                divHref0[divHref0.length - 1].textContent == ""
              ) {
                numb1++;
              }
            }

            if (
              divNotDel != null &&
              divNotDel != false &&
              divNotDel != "" &&
              divNotDel != [] &&
              divNotDel != undefined &&
              divNotDel.parentElement.parentElement.parentElement.childNodes[1]
                .firstChild.firstChild.firstChild.firstChild
            ) {
              //let href2=divNotDel.getAttribute('href').split('/')[4];
              href0.push([
                divNotDel.getAttribute("href").split("/")[4],
                divNotDel.parentElement.parentElement.parentElement
                  .childNodes[1].firstChild.firstChild.firstChild.firstChild
                  .textContent,
              ]);
              divNotDel.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //xóa thẻ div giảm dung lượng
              numb2 = 0; //console.log(href1);
            }
            if (
              divNotDel0 != null &&
              divNotDel0 != false &&
              divNotDel0 != "" &&
              divNotDel0 != [] &&
              divNotDel0 != undefined &&
              divNotDel0[divNotDel0.length - 1] != undefined
            ) {
              if (
                divNotDel0[divNotDel0.length - 1].parentElement.parentElement
                  .parentElement != undefined &&
                divNotDel0[divNotDel0.length - 1].parentElement.parentElement
                  .parentElement.textContent == ""
              ) {
                numb2++;
              }
            }
            if (
              ((divHref == null ||
                divHref == false ||
                divHref == "" ||
                divHref == [] ||
                divHref == undefined) &&
                (divNotDel == null ||
                  divNotDel == false ||
                  divNotDel == "" ||
                  divNotDel == [] ||
                  divNotDel == undefined)) ||
              (numb1 >= 20 && numb2 >= 20)
            ) {
              clearInterval(timer);
              resolve(); //console.log(href0);
            }
            divHref = "";
            divNotDel = "";
          }, 200 + Math.random() * 100);
        });
        return href0;
      });
      if (href != "" && href != [] && href != undefined) {
        for (var i = 0; i < href.length; i++) {
          output[i] = new Array(...href[i], "member");
          href[i] = [];
        }
        href = [];
      }
      return output;
    } catch (err) {
      // Crawling failed...
      console.log(err);
      return false;
    }
  }
  return false;
}
async function UIDsigninGroups(userID) {
  try {
    if (userID) {
      //thêm hàm get group danger vào để lấy từ DB
      var groupID0 = await user_ppt.getAllFbProb();
      var groupID = [];
      var groupSign = [];
      if (groupID0 != undefined && groupID0.length > 0) {
        for (var i = 0; i < groupID0.length; i++) {
          if (groupID0[i].type_fb.indexOf("group") >= 0)
            groupID.push(groupID0[i].id_fb);
        }
      }
      if (
        groupID != [] &&
        groupID != "" &&
        groupID != false &&
        groupID.length > 0
      ) {
        var numb = 0;
        for (var i = 0; i < groupID.length; i++) {
          await page.goto(
            "https://www.facebook.com/groups/" + groupID[i] + "/user/" + userID,
            { waitUntil: "networkidle2", timeout: 0 }
          );
          var title = await page.title();
          if (title.indexOf(" | Facebook") >= 0) {
            console.log("User: ", userID, " signined: ", groupID[i]);
            // return true;
            groupSign[numb] = new Array(groupID[i]);
            numb++;
          }
          if (title === "Facebook") {
            console.log("User: ", userID, " not signined: ", groupID[i]);
            // return false;
          }
          //groupID[i]=[];

          // return false;
        }
        if (
          groupSign != undefined &&
          groupSign != "" &&
          groupSign != false &&
          groupSign != [] &&
          groupSign.length > 0
        ) {
          return groupSign;
        } else {
          return false;
        }
      }
      return false;
    } else {
      console.log("Not find account FB");
      return false;
    }
  } catch (err) {
    // Crawling failed...
    console.log(err);
    return false;
  }
}
// hàm này không còn hoạt động
async function getPagesFbUID(uid) {
  if (uid) {
    try {
      await page.setViewport({ width: 1700, height: 10000 });
      await page.goto(
        "https://www.facebook.com/profile.php?id=" + uid + "&sk=likes",
        { waitUntil: "networkidle2", timeout: 0 }
      );
      await autoScroll(page);
      var href = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll(
            'body>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>a[role="link"]'
          ),
          (a) => [a.getAttribute("href"), a.textContent]
        );
      });
      //console.log(href);
      var output = new Array();
      if (href != "" && href != [] && href != false && href != undefined) {
        for (var i = 0; i < href.length; i++) {
          output[i] = new Array(...href[i]);
          href[i] = [];
        }
        href = [];
      }
      return output;
    } catch (err) {
      // Crawling failed...
      console.log(err);
      return false;
    }
  }
  return false;
}
async function getGroupsOfPages(uid) {
  if (uid) {
    try {
      await page.setViewport({ width: 1700, height: 20000 });
      await page.goto("https://www.facebook.com/" + uid + "/groups", {
        waitUntil: "networkidle2",
        timeout: 0,
      });
      await autoScroll(page);
      var href = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll(
            '[href*="https://www.facebook.com/groups/"]'
          ),
          (a) => [a.getAttribute("href"), a.textContent]
        )
      );
      //console.log(href);
      var output = new Array();
      var numb = 0;
      if (href != "" && href != [] && href != false && href != undefined) {
        for (var i = 0; i < href.length; i++) {
          if (
            href[i][0].indexOf("post_id=") < 0 &&
            href[i][0].indexOf("/posts/") < 0 &&
            href[i][0].indexOf("comment_id=") < 0
          ) {
            output[numb] = new Array(...href[i]);
            href[i] = [];
            numb++;
          }
        }
        href = [];
      }
      return output;
    } catch (err) {
      // Crawling failed...
      console.log(err);
      return false;
    }
  }
  return false;
}
async function getSubGroupsOGroups(uid) {
  if (uid) {
    try {
      await page.setViewport({ width: 1700, height: 20000 });
      await page.goto("https://www.facebook.com/groups/" + uid + "/subgroups", {
        waitUntil: "networkidle2",
        timeout: 0,
      });
      await autoScroll(page);
      var href = await page.evaluate(() =>
        Array.from(document.querySelectorAll("div>span>span>span>a"), (a) => [
          a.getAttribute("href").split("/")[4],
          a.textContent,
        ])
      );
      //console.log(href);
      var output = new Array();
      if (href != "" && href != [] && href != false && href != undefined) {
        for (var i = 0; i < href.length; i++) {
          output[i] = new Array(...href[i]);
          href[i] = [];
        }
        href = [];
      }
      return output;
    } catch (err) {
      // Crawling failed...
      console.log(err);
      return false;
    }
  }
  return false;
}
async function searchPagesOrgroups(key) {
  if (
    key != [] &&
    key != false &&
    key != undefined &&
    key != "" &&
    key != null
  ) {
    try {
      //pages, groups
      // if (type==undefined || type ==0 || type ==null) { var types = 'pages'} else {var types = 'groups'};
      var output = new Array();
      var numb = 0;
      var keys = key
        .replaceAll(" ", "%20")
        .replaceAll("/", "%20")
        .replaceAll("\\", "%20");
      console.log("scan Keys: " + keys);
      //page
      await page.setViewport({ width: 1700, height: 10000 });
      await page.goto("https://www.facebook.com/search/pages?q=" + keys, {
        waitUntil: "networkidle2",
        timeout: 0,
      });
      //await autoScroll(page);
      var hrefP = await page.evaluate(async () => {
        console.log("running evalute");
        var href0 = [];
        await new Promise((resolve, reject) => {
          var numb0 = 0;
          if (
            document.querySelectorAll("div>h2>span>span>span>a")[0] != "" ||
            document.querySelectorAll("div>h2>span>span>span>a")[0] != undefined
          ) {
            var textSelectorHref = "div>h2>span>span>span>a"; //'div>span>div>a''div>h2>span>span>span>a'
          } else {
            var textSelectorHref = "div>span>div>a"; //'div>span>div>a''div>h2>span>span>span>a'
          }
          console.log("textSelectorHref: ", textSelectorHref);
          var timer = setInterval(() => {
            let divHref0 = document.querySelectorAll(textSelectorHref);
            for (let i = 0; i < divHref0.length; i++) {
              if (
                divHref0[i] &&
                divHref0[i].textContent != "" &&
                divHref0[i].getAttribute("href").length > 20
              ) {
                var divHref = divHref0[i];
                break;
              }
            }
            //var divHref=document.querySelectorAll(textSelectorHref)[0];
            if (
              divHref != null &&
              divHref != false &&
              divHref != "" &&
              divHref != [] &&
              divHref != undefined &&
              divHref.textContent != undefined &&
              divHref.textContent != ""
            ) {
              href0.push([
                divHref.getAttribute("href"),
                divHref.parentElement.parentElement.parentElement.parentElement
                  .parentElement.parentElement.textContent,
                divHref.textContent,
              ]);
              numb0 = 0;
              divHref.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //xóa thẻ div giảm dung lượng
              //console.log(href1);
            }
            if (
              divHref0 != null &&
              divHref0 != false &&
              divHref0 != "" &&
              divHref0 != [] &&
              divHref0 != undefined &&
              divHref0[divHref0.length - 1] != undefined
            ) {
              if (
                divHref0[divHref0.length - 1] != undefined &&
                divHref0[divHref0.length - 1].textContent == ""
              ) {
                numb0++;
              }
            }
            if (
              divHref == null ||
              divHref == false ||
              divHref == "" ||
              divHref == [] ||
              divHref == undefined ||
              numb0 >= 20
            ) {
              clearInterval(timer);
              resolve(); //console.log(href0);
            }
            divHref = "";
          }, 200 + Math.random() * 100);
        });
        return href0;
      });
      //console.log ('href0/href0[0]: ' + href0+'/'+href0[0]);
      if (hrefP != "" && hrefP != [] && hrefP != false && hrefP != undefined) {
        for (var i = 0; i < hrefP.length; i++) {
          output[numb] = new Array(...hrefP[i]);
          hrefP[i] = [];
          numb++;
        }
        hrefP = [];
      }
      //group
      await page.setViewport({ width: 1700, height: 10000 });
      await page.goto("https://www.facebook.com/search/groups?q=" + keys, {
        waitUntil: "networkidle2",
        timeout: 0,
      });
      //await autoScroll(page);
      var hrefG = await page.evaluate(async () => {
        var href0 = [];
        await new Promise((resolve, reject) => {
          var numb1 = 0;
          var timer = setInterval(() => {
            if (
              document.querySelectorAll("div>h2>span>span>span>a")[0] != "" &&
              document.querySelectorAll("div>h2>span>span>span>a")[0] !=
                undefined
            ) {
              var textSelectorHref = "div>h2>span>span>span>a"; //'div>span>div>a''div>h2>span>span>span>a'
            } else {
              var textSelectorHref = "div>span>div>a"; //'div>span>div>a''div>h2>span>span>span>a'
            }
            //var textSelectorHref='div>span>div>a';//'div>span>div>a''div>h2>span>span>span>a'
            let divHref0 = document.querySelectorAll(textSelectorHref);
            var divHref = document.querySelectorAll(textSelectorHref)[0];
            if (
              divHref != null &&
              divHref != false &&
              divHref != "" &&
              divHref != [] &&
              divHref != undefined &&
              divHref.textContent != undefined &&
              divHref.textContent != ""
            ) {
              href0.push([
                divHref.getAttribute("href"),
                divHref.parentElement.parentElement.parentElement.parentElement
                  .parentElement.parentElement.textContent,
                divHref.textContent,
              ]);
              numb1 = 0;
              divHref.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //xóa thẻ div giảm dung lượng
              //console.log(href1);
            }
            if (
              divHref0 != null &&
              divHref0 != false &&
              divHref0 != "" &&
              divHref0 != [] &&
              divHref0 != undefined &&
              divHref0[divHref0.length - 1] != undefined
            ) {
              if (
                divHref0[divHref0.length - 1] != undefined &&
                divHref0[divHref0.length - 1].textContent == ""
              ) {
                numb1++;
              }
            }
            if (
              divHref == null ||
              divHref == false ||
              divHref == "" ||
              divHref == [] ||
              divHref == undefined ||
              numb1 >= 20
            ) {
              clearInterval(timer);
              resolve(); //console.log(href0);
            }
            divHref = "";
          }, 200 + Math.random() * 100);
        });
        return href0;
      });
      //console.log ('href1/href1[0]: ' + href1+'/'+href1[0]);
      if (hrefG != "" && hrefG != [] && hrefG != false && hrefG != undefined) {
        for (var i = 0; i < hrefG.length; i++) {
          output[numb] = new Array(...hrefG[i]);
          hrefG[i] = [];
          numb++;
        }
        hrefG = [];
      }
      //console.log(href);
      return output;
    } catch (err) {
      // Crawling failed...
      console.log(err);
      return false;
    }
  }
  console.log("No data Key: " + key);
  return false;
}
async function searchSTTContents() {
  try {
    //posts
    //if (dataUID==false) return false;
    // var type = UID0.type_fb;
    // var UID = UID0.id;
    var dataKeys = await user_ppt.getAllKeyFb();
    // key.keyword
    // const keys = key.replaceAll(" ","%20").replaceAll("/","%20").replaceAll("\\","%20");
    if (dataKeys == [] || dataKeys == undefined || dataKeys == "") return false;
    var output = new Array();
    var numb = 0;
    await page.setViewport({ width: 1700, height: 5000 });
    for (var i = 0; i < dataKeys.length; i++) {
      var href = [];
      var lengthPage = 0;
      const maxLengthPage = 1;
      var TimeRun = 0;
      const MaxTimeRun = 5;
      var keys = dataKeys[i].main
        .replaceAll(" ", "%20")
        .replaceAll("/", "%20")
        .replaceAll("\\", "%20");
      await page.goto("https://www.facebook.com/search/posts?q=" + keys, {
        waitUntil: "networkidle2",
        timeout: 0,
      });
      //var href=[];
      await new Promise((resolve, reject) => {
        var timer = setInterval(async () => {
          var href0 = [];
          // rê chuột vào thẻ a để lấy dữ liệu link
          //await page.waitForSelector('a[href*="#"]',5000);
          let Items = [];
          try {
            Items =
              (await page.$$('a[href*="#"]')) ||
              (await page.$$('a[href*="/posts/"]')); //var m=0;
          } catch (err) {
            console.log('Items a[href*="#"] err is: ', err);
            Items = [];
          }
          var clickedItem = false; //var m=0;
          if (
            Items != undefined &&
            Items != [] &&
            Items != "" &&
            Items != false &&
            Items != null &&
            Items[0] != undefined &&
            Items[0] != [] &&
            Items[0] != "" &&
            Items[0] != false &&
            Items[0] != null
          ) {
            for (let Item of Items) {
              let check = await ItemHover(Item);
              if (check == true) clickedItem = true;
            }
            Items = [];
          }
          if (clickedItem == true) {
            href0 = await page.evaluate(() => {
              var textSelector = '[href*="/posts/"]';
              return Array.from(
                document.querySelectorAll(textSelector),
                (a) => {
                  if (
                    a.getAttribute("href").indexOf("?q=") < 0 &&
                    a.getAttribute("href").indexOf("/search") < 0 &&
                    a.getAttribute("href").indexOf("#") < 0
                  ) {
                    var arr = [
                      a.getAttribute("href"),
                      a.parentElement.parentElement.parentElement.parentElement
                        .parentElement.parentElement.parentElement.parentElement
                        .parentElement.parentElement.textContent,
                      a.getAttribute("href").split("/")[
                        a.getAttribute("href").split("/").length - 2
                      ],
                    ];
                    a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //lengthPage=1;
                    return arr;
                  }
                  return [];
                }
              );
            });
          }
          //console.log(href);
          if (
            href0 != [] &&
            href0 != undefined &&
            href0 != "" &&
            href0 != false &&
            href0[0] != undefined &&
            href0[0] != null &&
            href0[0] != [] &&
            href0[0][0] != [] &&
            href0[0][0] != undefined &&
            href0[0][0] != null
          ) {
            TimeRun++;
            //lengthPage=1;
            href.push(...href0);
            href0 = [];
          } else {
            lengthPage++;
            if (
              href0 == undefined ||
              href0 == null ||
              href0 == "" ||
              (href0 && href0.length == 0)
            ) {
              lengthPage = 1000;
            } else {
              if (lengthPage <= maxLengthPage) {
                console.log(
                  "Rerun Link: https://www.facebook.com/search/posts?q=" + keys
                );
                href = []; // giải phóng biến
                await reloadPage(
                  page,
                  "https://www.facebook.com/search/posts?q=" + keys
                );
                TimeRun = 0;
              }
            }
            //if (lengthPage>=20) check=true;
          }
          if (lengthPage > maxLengthPage || TimeRun >= MaxTimeRun) {
            clearInterval(timer);
            resolve(); //console.log(href0);
          }
          //};
        }, DelayTimes + Math.random() * RandomDelayTimes);
      });

      if (href != "" && href != [] && href != false && href != undefined) {
        for (var j = 0; j < href.length; j++) {
          output[numb] = new Array(...href[j], dataKeys[i].keyword);
          href[j] = [];
          numb++;
        }
      }
      href = [];
    }
    return output;
  } catch (err) {
    // Crawling failed...
    console.log(err);
    return false;
  }
}
async function searchSTTContentsinUID(UID0) {
  if (UID0 && UID0 != undefined) {
    try {
      //posts
      // var dataUID = await getfacebookUID(UID);
      // if (dataUID==false) return false;
      var type = UID0[1];
      var UID = UID0[0];
      var dataKeys = await user_ppt.getAllKeyFb();
      // key.keyword
      // const keys = key.replaceAll(" ","%20").replaceAll("/","%20").replaceAll("\\","%20");
      if (
        dataKeys == [] ||
        dataKeys == undefined ||
        dataKeys == "" ||
        dataKeys == false
      )
        return false;
      var output = new Array();
      var numb = 0;
      const maxScan = 10;
      for (var i = 0; i < dataKeys.length; i++) {
        var keys = dataKeys[i].main
          .replaceAll(" ", "%20")
          .replaceAll("/", "%20")
          .replaceAll("\\", "%20");
        await page.setViewport({ width: 1700, height: 5000 });
        if (type == "userID")
          await page.goto(
            "https://www.facebook.com/profile/" + UID + "/search/?q=" + keys,
            { waitUntil: "networkidle2", timeout: 0 }
          );
        if (type == "groupID")
          await page.goto(
            "https://www.facebook.com/groups/" + UID + "/search/?q=" + keys,
            { waitUntil: "networkidle2", timeout: 0 }
          );
        if (type == "pageID")
          await page.goto(
            "https://www.facebook.com/page/" + UID + "/search/?q=" + keys,
            { waitUntil: "networkidle2", timeout: 0 }
          );
        //await autoScroll(page);
        //var href=[];
        await new Promise((resolve, reject) => {
          var num = 0;
          var timer = setInterval(async () => {
            //await page.waitForSelector('a[href="#"]',5000);
            let Items = [];
            try {
              Items =
                (await page.$$('a[href*="#"]')) ||
                (await page.$$('a[href*="/posts/"]')); //var m=0;
            } catch (err) {
              console.log('Items a[href*="#"] err is: ', err);
              Items = [];
            }
            var clickedItem = false;
            if (
              Items != undefined &&
              Items != [] &&
              Items != "" &&
              Items != false &&
              Items != null &&
              Items[0] != undefined &&
              Items[0] != [] &&
              Items[0] != "" &&
              Items[0] != false &&
              Items[0] != null
            ) {
              for (let Item of Items) {
                let check = await ItemHover(Item);
                if (check == true) clickedItem = true;
              }
              Items = [];
            }
            if (clickedItem == true) {
              var href = await page.evaluate(() => {
                var href0 = [];
                let divHref0 = document.querySelectorAll('a[href*="/posts/"]');
                //var divHref=document.querySelectorAll('a[href*="/posts/"]')[0];
                if (
                  divHref0 != undefined &&
                  divHref0[divHref0.length - 1] != undefined &&
                  divHref0[divHref0.length - 1].textContent == ""
                ) {
                  num++;
                } else {
                  for (var i = 0; i < divHref0.length; i++) {
                    if (
                      divHref0[i] != null &&
                      divHref0[i] != false &&
                      divHref0[i] != "" &&
                      divHref0[i] != [] &&
                      divHref0[i] != undefined &&
                      divHref0[i].textContent != undefined &&
                      divHref0[i].textContent != ""
                    ) {
                      href0.push([
                        divHref0[i].getAttribute("href"),
                        divHref0[i].parentElement.parentElement.parentElement
                          .parentElement.parentElement.parentElement
                          .parentElement.parentElement.parentElement
                          .parentElement.parentElement.parentElement
                          .parentElement.parentElement.parentElement
                          .parentElement.parentElement.parentElement
                          .parentElement.parentElement.parentElement
                          .parentElement.textContent,
                      ]);
                      num = 0; //console.log(href1);
                      divHref0[
                        i
                      ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //xóa thẻ div giảm dung lượng
                    }
                  }
                }
                return href0;
              });
            }
            if (
              href == null ||
              href == false ||
              href == "" ||
              href == [] ||
              href == undefined
            ) {
              num++;
            } else {
              //if (href!="" && href!=[] && href!=false && href!=undefined) {
              for (var j = 0; j < href.length; j++) {
                output[numb] = new Array(...href[j], dataKeys[i].keyword);
                href[j] = [];
                numb++;
              }
              //};
              href = [];
            }
            if (num >= maxScan) {
              clearInterval(timer);
              resolve(); //console.log(href0);
            }
          }, DelayTimes + Math.random() * RandomDelayTimes);
        });
      }
      return output;
    } catch (err) {
      // Crawling failed...
      console.log(err);
      return false;
    }
  }
  return false;
}
// các hàm dưới chưa tối ưu bộ nhớ===================================================================
async function getContentSTTFbUID(uid, TimeRestartSV) {
  if (uid) {
    try {
      if (TimeRestartSV == 1) {
        TimeRestartSV = 0;
        await restartBrower(); // chạy hàm này khi đệ quy, nhằm reset lại brower
      }
      var output = new Array();
      var listUIDPosst = await user_ppt.getUIDContentByUID(uid); // lấy ra ID từ server
      //console.log('Get STT of UID: ' + uid);
      var href = [];
      await page.setViewport({ width: 1700, height: 9000 });
      await page.goto("https://www.facebook.com/" + uid, {
        waitUntil: "networkidle2",
        timeout: 0,
      });
      //console.log('login UID: ' + uid);
      // do{
      await new Promise((resolve, reject) => {
        var lengthPage = 0;
        const maxLengthPage = 1;
        var TimeRun = 0;
        const MaxTimeRun = 5;
        var clickedItem = false;
        //var href00 =[];
        var timer = setInterval(async () => {
          // rê chuột vào thẻ a để lấy dữ liệu link
          let Items = [];
          try {
            Items =
              (await page.$$('a[href*="#"]')) ||
              (await page.$$('a[href*="/posts/"]')); //var m=0;
            console.log(
              'Items a[href*="#"] & a[href*="/posts/"]: ',
              Items.length
            );
          } catch (err) {
            //console.log('Items a[href="#"] err is: ', err);
            Items = [];
          }

          if (
            Items != undefined &&
            Items != [] &&
            Items != "" &&
            Items != false &&
            Items != null &&
            Items[0] != undefined &&
            Items[0] != [] &&
            Items[0] != "" &&
            Items[0] != false &&
            Items[0] != null
          ) {
            //await page.waitForXPath('//a[href="#"]',3000);
            for (let i = 0; i < Items.length; i++) {
              let check = await ItemHover(Items[i]);
              if (check == true) clickedItem = true;
            }
            Items = [];
            console.log("Hover finished!");
          }
          if (clickedItem == true) {
            var href0 = [];
            try {
              href0 = await page.evaluate(() => {
                return Array.from(
                  document.querySelectorAll("span>span>span>span>a"),
                  (a) => {
                    var arr = [];
                    if (
                      a.getAttribute("href").indexOf("/posts/") >= 0 &&
                      a.getAttribute("href").indexOf("story_fbid=") < 0 &&
                      a.getAttribute("href").indexOf("#") < 0
                    ) {
                      arr = [
                        a
                          .getAttribute("href")
                          .split("posts/")[1]
                          .split("?")[0]
                          .split("/")[0],
                        a.parentElement.parentElement.parentElement
                          .parentElement.parentElement.parentElement
                          .parentElement.parentElement.parentElement
                          .parentElement.textContent,
                      ];
                      a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //lengthPage=1;TimeRun++;

                      return arr;
                      //console.log(arr);
                    } else if (
                      a.getAttribute("href").indexOf("story_fbid=") >= 0 &&
                      a.getAttribute("href").indexOf("#") < 0
                    ) {
                      arr = [
                        a
                          .getAttribute("href")
                          .split("story_fbid=")[1]
                          .split("&")[0]
                          .split("/")[0],
                        a.parentElement.parentElement.parentElement
                          .parentElement.parentElement.parentElement
                          .parentElement.parentElement.parentElement
                          .parentElement.textContent,
                      ];
                      a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //lengthPage=1;TimeRun++;
                      return arr;
                    } else if (
                      a.getAttribute("href").indexOf("/video/") >= 0 &&
                      a.getAttribute("href").indexOf("#") < 0
                    ) {
                      a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //lengthPage=1;TimeRun++;
                    }
                    return [];
                  }
                );
              });
            } catch (err) {
              console.log(err);
              //href0 = [];
            }
          } else {
            var href0 = "NotHover";
            console.log("Not Hover Item!!!");
          }
          // TimeRun++;
          if (
            href0 != [] &&
            href0 != undefined &&
            href0 != "" &&
            href0 != false &&
            href0[0] != undefined &&
            href0[0] != null &&
            href0[0] != [] &&
            href0[0][0] != [] &&
            href0[0][0] != undefined &&
            href0[0][0] != null &&
            typeof href0 == "object" &&
            href0 != "NotHover"
          ) {
            //console.log('href0: ',href0.length);
            TimeRun++;
            //lengthPage=1;//Reset
            //href.push(...href0);//thêm phần tử vào dữ liệu chung
            for (var z = 0; z < href0.length; z++) {
              if (href0[z] != "" && href0[z] != []) {
                href.push(href0[z]);
              }
            }
            if (
              listUIDPosst != undefined &&
              listUIDPosst != [] &&
              listUIDPosst != null &&
              listUIDPosst != "" &&
              listUIDPosst != false
            ) {
              var check = false;
              for (var i = 0; i < listUIDPosst.length; i++) {
                for (var j = 0; j < href0.length; j++) {
                  if (
                    href0[j] != "" &&
                    href0[j] != undefined &&
                    href0[j] != [] &&
                    href0[j][0] != "" &&
                    href0[j][0] != undefined &&
                    href0[j][0] != [] &&
                    href0[j][0].indexOf(listUIDPosst[i].id_cmt) >= 0
                  ) {
                    //thì ngưng
                    //console.log('tìm thấy STT đã quét!');
                    check = true;
                    //j=href0.length;
                    break;
                  }
                }
              }
            }
          } else {
            lengthPage++;
            console.log("Not Get href0: ", href0.length);
            if (
              href0 == undefined ||
              href0 == null ||
              href0 == "" ||
              href0 == [] ||
              (href0 && href0.length == 0)
            ) {
              lengthPage = 1000;
            } else {
              if (lengthPage <= maxLengthPage && TimeRestartSV == undefined) {
                console.log("Rerun Link: https://www.facebook.com/" + uid);
                href = []; // reset biến
                TimeRestartSV = 1;
                clearInterval(timer);
                resolve(); //console.log(href0);
                //return getContentSTTFbUID(uid,1);  // đệ quy lại hàm 1 lần
              } else {
                lengthPage = 1000;
              }
            }
          }

          if (
            check == true ||
            lengthPage > maxLengthPage ||
            TimeRun >= MaxTimeRun
          ) {
            //console.log('clearInterval and resolve');
            //return href00;
            TimeRestartSV = 0;
            clearInterval(timer);
            resolve(); //console.log(href0);
          }
          //console.log('rerun timer');
        }, DelayTimes + Math.random() * RandomDelayTimes);
      });
      // } while (check == false || lengthPage < maxLengthPage);
      //console.log('got href: '+ href);
      if (TimeRestartSV == 1) {
        try {
          return await getContentSTTFbUID(uid, 1);
        } catch (err) {
          console.log("Đệ quy getContentSTTFbUID gặp lỗi: ", err);
        }
      } //đệ quy lại hàm khi bị lỗi phía trên có biến TimeRestartSV
      if (
        href != undefined &&
        href != false &&
        href != "" &&
        href.length >= 3
      ) {
        var lengt = 3;
      } else if (
        href != undefined &&
        href != false &&
        href != "" &&
        href.length < 3
      ) {
        var lengt = href.length;
      } else {
        var lengt = 0;
      }

      // thêm lại ID content mới
      if (lengt > 0) {
        // xóa hết post id trong server
        await user_ppt.deleteIDContentByUID(uid);
        for (var i = 0; i < lengt; i++) {
          // thêm data vào server
          var data0 = {
            id_fb: uid,
            id_cmt: href[i][0],
          };
          await user_ppt.addUIDContent(data0); //console.log('add content to DB');
        }
      }
      if (
        href != "" &&
        href != [] &&
        href != undefined &&
        href != false &&
        href.length > 0
      ) {
        for (var i = 0; i < href.length; i++) {
          output[i] = new Array(
            "https://www.facebook.com/" + uid + "/posts/" + href[i][0],
            href[i][1]
          );
          href[i] = [];
        }
        href = [];
      }
      //console.log(href);
      //console.log('outputed: ',output.length);
      return output;
    } catch (err) {
      // Crawling failed...
      console.log(err);
      return false;
    }
  }
  return false;
}
async function getUIDBylinkSTT(link, type) {
  if (link) {
    try {
      console.log("start get UID link: ", link);
      var href = "";
      var output = [];
      await page.setViewport({ width: 1700, height: 1000 });
      // lặp lại lần 2 từ đoạn này
      await page.goto(link, { waitUntil: "networkidle2", timeout: 0 });
      //await autoScrollNumber(page);
      var href0 = await page.evaluate(function () {
        var href = [];
        href.push(
          document.querySelector("div>div>span>h2>span>span>a")
            ? document
                .querySelector("div>div>span>h2>span>span>a")
                .getAttribute("href")
            : ""
        );
        href.push(
          document.querySelector("div>span>h2>span>a")
            ? document.querySelector("div>span>h2>span>a").getAttribute("href")
            : ""
        );
        href.push(
          document.querySelector("div>span>h2>span>strong>span>a")
            ? document
                .querySelector("div>span>h2>span>strong>span>a")
                .getAttribute("href")
            : ""
        );
        href.push(
          document.querySelector("div>div>span>h2>strong>span>a")
            ? document
                .querySelector("div>div>span>h2>strong>span>a")
                .getAttribute("href")
            : ""
        );
        href.push(
          document.querySelector("span>span>span>a")
            ? document.querySelector("span>span>span>a").getAttribute("href")
            : ""
        );
        for (let i = 0; i < href.length; i++) {
          if (href[i] != "") {
            if (href[i].indexOf("user/") >= 0)
              return href[i].split("user/")[1].split("/")[0];
            return href[i];
          }
        }
        return [];
      });
      //console.log(href0,href1);
      if (href0 != [] && href0 != "" && href0 != false && href0 != undefined)
        return (output = await getfacebookUID(href0, type));
      return false;
    } catch (err) {
      // Crawling failed...
      console.log(err);
      return false;
    }
  }
  return false;
}
async function deleteCookiesInPPT() {
  try {
    // await page.setCookie('');
    const client = await page.target().createCDPSession();
    await client.send("Network.clearBrowserCookies");
    await client.send("Network.clearBrowserCache");
    console.log("deleted Cookies");
    return true;
  } catch (err) {
    // Crawling failed...
    console.log(err);
    return false;
  }
}
async function getContentsCmtShare(uid) {
  if (uid) {
    try {
      var href = new Array();
      var numbDB = 0;
      await page.setViewport({ width: 1700, height: 1000 });
      if (uid.indexOf("http") < 0 && uid.indexOf(".com") < 0)
        uid = "https://facebook.com/" + uid;
      await page.goto(uid, { waitUntil: "networkidle2", timeout: 0 });
      //await page.waitForNavigation();
      try {
        //cmts
        ////*[contains(text(),'here')]
        await page.setViewport({ width: 1700, height: 10000 });
        var cmtss = await page.evaluate(async () => {
          var boxSTTs = document.querySelectorAll(
            "body>div>div>div>div>div>div>div>div>div>div>div"
          );
          var thisboxSTT;
          var numbBox = 0;
          var numbph = 0;
          var buttonPhuHops = document.querySelectorAll(
            "div>div>div>div>div>div>div>div>div>span"
          );
          //var Delbtnph;
          if (
            buttonPhuHops != [] &&
            buttonPhuHops != false &&
            buttonPhuHops != null &&
            buttonPhuHops != undefined &&
            buttonPhuHops != ""
          ) {
            for (let buttonPhuHop of buttonPhuHops) {
              numbph++;
              if (
                buttonPhuHop != undefined &&
                (buttonPhuHop.textContent.indexOf("Phù hợp") >= 0 ||
                  buttonPhuHop.textContent.indexOf(" liên quan nhất") >= 0)
              ) {
                await buttonPhuHop.click();
                //console.log('click1!');
                //Delbtnph=buttonPhuHop;
                break;
              }
              if (numbph >= 40) {
                break;
              }
            }
            buttonPhuHops = [];
            var btnTatcacmts = document.querySelectorAll(
              "div>div:nth-child(3)>div>div>div:nth-child(2)>span"
            );
            if (
              btnTatcacmts != [] &&
              btnTatcacmts != false &&
              btnTatcacmts != null &&
              btnTatcacmts != undefined &&
              btnTatcacmts != ""
            ) {
              var n = 0;
              for (let u = 0; u < btnTatcacmts.length; u++) {
                n++;
                if (
                  btnTatcacmts[u] != undefined &&
                  btnTatcacmts[u].textContent.indexOf(" cả bình luận") >= 0
                ) {
                  await btnTatcacmts[u].click();
                  //console.log('click2!');
                  break;
                }
                // if(document.querySelectorAll('div>div:nth-child(3)>div>div>div:nth-child(2)>span')[3]!=undefined
                // && document.querySelectorAll('div>div:nth-child(3)>div>div>div:nth-child(2)>span')[3].textContent.indexOf("tất cả bình luận")>=0){
                //     await document.querySelectorAll('div>div:nth-child(3)>div>div>div:nth-child(2)>span')[3].parentElement.parentElement.parentElement.parentElement.click();
                //     break;
                // };
                // if(document.querySelectorAll('div>div:nth-child(3)>div>div>div:nth-child(2)>span')[5]!=undefined
                // && document.querySelectorAll('div>div:nth-child(3)>div>div>div:nth-child(2)>span')[5].textContent.indexOf("tất cả bình luận")>=0){
                //     await document.querySelectorAll('div>div:nth-child(3)>div>div>div:nth-child(2)>span')[5].parentElement.parentElement.parentElement.parentElement.click();
                //     break;
                // };
                if (n >= 20) {
                  break;
                }
              }
            }

            btnTatcacmts = [];
            // if (Delbtnph!=undefined && Delbtnph!=null && Delbtnph!=false && Delbtnph!=[] && Delbtnph!=""){
            //     Delbtnph.parentElement.remove();
            // };
          }
          if (
            boxSTTs == false ||
            boxSTTs == undefined ||
            boxSTTs == [] ||
            boxSTTs == "" ||
            boxSTTs == null
          )
            return [];
          for (let boxSTT of boxSTTs) {
            numbBox++;
            if (
              boxSTT.querySelector('[href*="comment_id="]') &&
              boxSTT.querySelector('[href*="comment_id="]').getAttribute("href")
                .length > 0
            ) {
              thisboxSTT = boxSTT;
              boxSTTs = null;
              console.log("Get box success!");
              break;
            }
            if (numbBox >= 15) {
              boxSTTs = null;
              break;
            }
          }
          if (
            thisboxSTT &&
            thisboxSTT !== null &&
            thisboxSTT !== undefined &&
            thisboxSTT !== [] &&
            thisboxSTT !== false &&
            thisboxSTT !== ""
          ) {
            await new Promise((resolve, reject) => {
              var btncmts0 = Array.from(
                thisboxSTT.querySelectorAll("span")
              ).filter((el) => {
                if (el.textContent.indexOf(" phản hồi") >= 0) {
                  return true;
                }
                return false;
              })[0];
              var btnbls0 = Array.from(
                thisboxSTT.querySelectorAll("span")
              ).filter((el) => {
                if (
                  el.textContent.indexOf(" bình luận") >= 0 &&
                  el.textContent.indexOf(" bình luận ") < 0 &&
                  el.textContent.indexOf("Tất cả bình luận") < 0 &&
                  el.textContent.indexOf("Viết bình luận") < 0
                ) {
                  return true;
                }
                return false;
              })[0];
              var numbcmt = 0;
              //console.log('btn', btncmts0.length)
              var timer = setInterval(() => {
                if (
                  btncmts0 &&
                  btncmts0 != [] &&
                  btncmts0 != null &&
                  btncmts0 != undefined &&
                  btncmts0 != "" &&
                  btncmts0 != false
                ) {
                  btncmts0.click();
                  console.log("btncmts0 clicked!");
                  btncmts0 = [];
                  numbcmt = 0;
                }
                if (
                  btnbls0 &&
                  btnbls0 != [] &&
                  btnbls0 != null &&
                  btnbls0 != undefined &&
                  btnbls0 != false &&
                  btnbls0 != ""
                ) {
                  btnbls0.click();
                  console.log("btnbls0 clicked!");
                  btnbls0 = [];
                  numbcmt = 0;
                }
                numbcmt++;
                btncmts0 = Array.from(
                  thisboxSTT.querySelectorAll("span")
                ).filter((el) => {
                  if (el.textContent.indexOf(" phản hồi") >= 0) {
                    return true;
                  }
                  return false;
                })[0];
                btnbls0 = Array.from(
                  thisboxSTT.querySelectorAll("span")
                ).filter((el) => {
                  if (
                    el.textContent.indexOf(" bình luận") >= 0 &&
                    el.textContent.indexOf("Tất cả bình luận") < 0
                  ) {
                    return true;
                  }
                  return false;
                })[1];
                if (
                  ((btncmts0 === [] ||
                    btncmts0 === undefined ||
                    btncmts0 === null ||
                    btncmts0 === "" ||
                    btncmts0 === false) &&
                    (btnbls0 === [] ||
                      btnbls0 === undefined ||
                      btnbls0 === null ||
                      btnbls0 === "" ||
                      btnbls0 === false)) ||
                  numbcmt >= 10
                ) {
                  console.log("btnbls0 close!");
                  btncmts0 = [];
                  btnbls0 = [];
                  clearInterval(timer);
                  resolve();
                }
              }, 1000 + Math.random() * 500);
            });
            return Array.from(
              thisboxSTT.querySelectorAll(
                '[href*="comment_id="][aria-hidden=true]'
              ),
              (a) => {
                var arr = [
                  a.getAttribute("href"),
                  a.parentElement.parentElement.parentElement.textContent,
                ];
                a.parentElement.parentElement.parentElement.parentElement.remove(); //xóa dữ liệu thừa
                return arr;
              }
            );
          } else {
            return;
          }
        });
        if (
          cmtss &&
          cmtss != [] &&
          cmtss != null &&
          cmtss != undefined &&
          cmtss != "" &&
          cmtss != false
        ) {
          console.log("cmts get success: ", cmtss.length);
          for (var i = 0; i < cmtss.length; i++) {
            href[numbDB] = new Array(...cmtss[i], "cmt");
            cmtss[i] = [];
            numbDB++;
          }
        } else {
          console.log("cmts get fail");
        }
      } catch (err) {
        // Crawling failed...
        console.log("get cmts err----------", err);
      }
      //share
      try {
        await page.setViewport({ width: 1700, height: 10000 });
        var shares = await page.evaluate(async () => {
          var btn = document.querySelectorAll("span>div>span");
          if (
            btn == false ||
            btn == "" ||
            btn == undefined ||
            btn == [] ||
            btn == null
          )
            return [];
          for (var i = 0; i < 20; i++) {
            if (
              btn[i] &&
              btn[i] != undefined &&
              btn[i] != false &&
              btn[i] != "" &&
              btn[i] != null
            ) {
              if (btn[i].textContent.indexOf(" lượt chia sẻ") >= 0) {
                document.querySelectorAll("span>div>span")[i].click();
                console.log("Clicked btn Share");
                break;
              }
            }
            if (i == 19) {
              return [];
            }
          }
          var share1 = [];
          var numb = 0;
          var numb1 = 0;
          await new Promise((resolve, reject) => {
            var timer = setInterval(() => {
              //nhóm 1
              let divHref0 = document.querySelectorAll("div>span>h3>span>a");
              var divHref = document.querySelectorAll("div>span>h3>span>a")[0];
              if (
                divHref != null &&
                divHref != false &&
                divHref != "" &&
                divHref != [] &&
                divHref != undefined &&
                divHref.textContent != undefined &&
                divHref.textContent != ""
              ) {
                share1.push([
                  divHref.getAttribute("href"),
                  divHref.textContent,
                ]);
                divHref.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //xóa thẻ div giảm dung lượng
                numb = 0;
              }
              if (
                divHref0[divHref0.length - 1] != undefined &&
                divHref0[divHref0.length - 1].textContent == ""
              ) {
                numb++;
              }
              //nhóm 2
              let divHref01 = document.querySelectorAll("div>span>span>span>a");
              var divHref1 = document.querySelectorAll(
                "div>span>span>span>a"
              )[0];
              if (
                divHref1 != null &&
                divHref1 != false &&
                divHref1 != "" &&
                divHref1 != [] &&
                divHref1 != undefined &&
                divHref1.textContent != undefined &&
                divHref1.textContent != ""
              ) {
                share1.push([
                  divHref1.getAttribute("href"),
                  divHref1.textContent,
                ]);
                divHref1.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //xóa thẻ div giảm dung lượng
                numb1 = 0;
              }
              if (
                divHref01[divHref01.length - 1] != undefined &&
                divHref01[divHref01.length - 1].textContent == ""
              ) {
                numb1++;
              }
              if (
                ((divHref == null ||
                  divHref == false ||
                  divHref == "" ||
                  divHref == [] ||
                  divHref == undefined) &&
                  (divHref1 == null ||
                    divHref1 == false ||
                    divHref1 == "" ||
                    divHref1 == [] ||
                    divHref1 == undefined)) ||
                (numb >= 20 && numb1 >= 20)
              ) {
                clearInterval(timer);
                resolve(); //console.log(share1);
              }
              divHref = "";
              divHref1 = "";
            }, 500 + Math.random() * 200);
          });
          return share1;
          // return Array.from(document.querySelectorAll('div>span>h3>span>a'),a => a.getAttribute('href'));
        });
        if (
          shares &&
          shares != [] &&
          shares != null &&
          shares != false &&
          shares != undefined
        ) {
          console.log("share get success: ", shares.length);
          for (var i = 0; i < shares.length; i++) {
            href[numbDB] = new Array(...shares[i], "share");
            shares[i] = [];
            numbDB++;
          }
        } else {
          console.log("share get fail");
        }
        //};
      } catch (err) {
        // Crawling failed...
        console.log("get share err----------", err);
      }
      numbDB = null;
      //console.log(href);
      return href;
    } catch (err) {
      // Crawling failed...
      console.log("get err All----------", err);
      return false;
    }
  }
  return false;
}
async function getContentsLike(uid) {
  if (uid) {
    try {
      var href = new Array();
      var numbDB = 0;
      await page.setViewport({ width: 1700, height: 10000 });
      if (uid.indexOf("http") < 0 && uid.indexOf(".com") < 0)
        uid = "https://facebook.com/" + uid;
      await page.goto(uid, { waitUntil: "networkidle2", timeout: 0 });
      //await page.waitForNavigation();
      //likesawait
      try {
        await page.setViewport({ width: 1700, height: 10000 });
        var likes = await page.evaluate(async () => {
          //await document.querySelectorAll('span>div>span')[0].click()
          var spanlikes = document.querySelectorAll(
            "div>div>div>span>div>span"
          );
          var btnlikes;
          //var btnlikesnumb;
          var numbspanlike = 0;
          if (
            spanlikes == false ||
            spanlikes == "" ||
            spanlikes == [] ||
            spanlikes == undefined ||
            spanlikes == null
          )
            return [];
          for (let spanlike of spanlikes) {
            if (
              spanlike.textContent &&
              spanlike.textContent.length > 0 &&
              spanlike.textContent !== null &&
              spanlike.textContent !== undefined
            ) {
              numbspanlike++;
              if (
                spanlike.textContent.indexOf("K") >= 0 ||
                isNaN(
                  spanlike.textContent.slice(
                    0,
                    spanlike.textContent.indexOf("K")
                  )
                ) === false
              ) {
                //btnlikesnumb=(Number(spanlike.textContent.slice(0,spanlike.textContent.indexOf('K')))+1)*1000;
                btnlikes = spanlike;
                spanlike = [];
                break;
              }
              if (isNaN(spanlike.textContent) === false) {
                //btnlikesnumb=Number(spanlike.textContent);
                btnlikes = spanlike;
                spanlike = [];
                break;
              }
              if (
                spanlike.parentElement.parentElement.parentElement.parentElement
                  .childNodes[0] &&
                spanlike.parentElement.parentElement.parentElement.parentElement.childNodes[0]
                  .getAttribute("aria-label")
                  .indexOf("bày tỏ cảm xúc") >= 0
              ) {
                //btnlikesnumb=Number(spanlike.textContent);
                btnlikes = spanlike;
                spanlike = [];
                break;
              }
              if (numbspanlike > 10) {
                btnlikes = [];
                break;
              }
            }
          }
          if (
            btnlikes !== [] &&
            btnlikes !== undefined &&
            btnlikes !== null &&
            btnlikes !== "" &&
            btnlikes !== false
          ) {
            await btnlikes.click();
            btnlikes = null;

            var like = [];
            var numb = 0;
            await new Promise((resolve, reject) => {
              var timer = setInterval(() => {
                let divHref0 = document.querySelectorAll("div>div>span>div>a");
                var divHref =
                  document.querySelectorAll("div>div>span>div>a")[0];
                if (
                  divHref != null &&
                  divHref != false &&
                  divHref != "" &&
                  divHref != [] &&
                  divHref != undefined &&
                  divHref.textContent != undefined &&
                  divHref.textContent != ""
                ) {
                  like.push([
                    divHref.getAttribute("href"),
                    divHref.textContent,
                  ]);
                  divHref.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.remove(); //xóa thẻ div giảm dung lượng
                }
                if (
                  (divHref0[divHref0.length - 1] != undefined &&
                    divHref0[divHref0.length - 1].textContent == "") ||
                  divHref == null ||
                  divHref == false ||
                  divHref == "" ||
                  divHref == [] ||
                  divHref == undefined
                ) {
                  numb++;
                }
                if (numb >= 20) {
                  // thêm 1 nút thoát box like
                  clearInterval(timer);
                  resolve(); //console.log(like);
                }
                divHref = "";
              }, 200 + Math.random() * 100);
            });
            return like;
          } else {
            return [];
          }
        });
        if (
          likes &&
          likes != [] &&
          likes != undefined &&
          likes != "" &&
          likes != false
        ) {
          console.log("like get success: ", likes.length);
          for (var i = 0; i < likes.length; i++) {
            href[numbDB] = new Array(...likes[i], "like");
            likes[i] = [];
            numbDB++;
          }
        } else {
          console.log("like get fail");
        }
        //};
      } catch (err) {
        // Crawling failed...
        console.log("get like err----------", err);
      }
      numbDB = null;
      //console.log(href);
      return href;
    } catch (err) {
      // Crawling failed...
      console.log("get err All----------", err);
      return false;
    }
  }
  return false;
}
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var numb = 0;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        var distance = 3000 + Math.random() * 1000;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          numb++;
        }
        if (totalHeight < scrollHeight) {
          numb = 0;
        }
        if (numb >= 15 && totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 3000 + Math.random() * 1000);
    });
  });
}
async function fillContentSTTbyKeys(data, Keys) {
  if (data && Keys) {
    try {
      var keyOfdata = false;
      // var Keys = await user_ppt.getAllKeyFb();
      if (!Keys || Keys == undefined || Keys == null || Keys == "")
        return false;
      // for (let data of datas){
      //keyOfdata[0] = new Array (false);
      //console.log(Keys)
      for (let Key of Keys) {
        //if (user_ppt.removeVietnameseTones(data).indexOf(Key.keyword)>=0){
        if (
          data.toLowerCase().indexOf(Key.main.toLowerCase()) >= 0 ||
          data
            .replaceAll(",", "")
            .replaceAll(".", "")
            .replaceAll("-", "")
            .replaceAll("_", "")
            .replaceAll("'", "")
            .replaceAll("`", "")
            .toLowerCase()
            .indexOf(
              Key.main
                .replaceAll(",", "")
                .replaceAll(".", "")
                .replaceAll("-", "")
                .replaceAll("_", "")
                .replaceAll("'", "")
                .replaceAll("`", "")
                .toLowerCase()
            ) >= 0
        ) {
          keyOfdata = Key.main;
          await user_ppt.updateNumberKeybyKey(
            Number(Key.appeared) + 1,
            Key.keyword
          );
          break;
        }
        //};
      }

      return keyOfdata;
    } catch (err) {
      // Crawling failed...
      console.log(err);
      return false;
    }
  }
  return false;
}
async function fillbyTrain(data) {
  if (data) {
    try {
      var keyOfdata = false;
      var Keys = await user_ppt.getAllKeytrain();
      if (!Keys || Keys == undefined || Keys == null || Keys == "")
        return false;
      // for (let data of datas){
      for (let Key of Keys) {
        // if (user_ppt.removeVietnameseTones(data).indexOf(Key.keytrain)>=0){
        //     keyOfdata[0] = new Array (true);
        //    break;
        // };
        if (data.toLowerCase().indexOf(Key.keytrain.toLowerCase()) >= 0) {
          keyOfdata = true;
        }
        if (
          data
            .replaceAll(" ", "")
            .replaceAll(",", "")
            .replaceAll(".", "")
            .replaceAll("-", "")
            .replaceAll("_", "")
            .replaceAll("'", "")
            .replaceAll("`", "")
            .toLowerCase()
            .indexOf(
              Key.keytrain
                .replaceAll(" ", "")
                .replaceAll(",", "")
                .replaceAll(".", "")
                .replaceAll("-", "")
                .replaceAll("_", "")
                .replaceAll("'", "")
                .replaceAll("`", "")
                .toLowerCase()
            ) >= 0
        ) {
          keyOfdata = true;
          //console.log('key: ',Key.main);
        }
      }
      // };
      return keyOfdata;
    } catch (err) {
      // Crawling failed...
      console.log(err);
      return false;
    }
  }
  return false;
}
async function reloadPage(pages, link) {
  try {
    await pages.goto(link, { waitUntil: "networkidle2", timeout: 0 }); // chạy lại lần 2
    //await page.waitForNavigation();
  } catch (err) {
    console.log("reloadPage err is: ", err);
    // clearInterval(timer);
    // resolve(); //console.log(href0);
  }
}
async function ItemHover(Item) {
  try {
    await Item.hover(); //m++
    //console.log('Hover Finished!')
    return true;
  } catch (err) {
    //console.log('Item hover err', err);
    return false;
  }
}
async function restartBrower() {
  await closePuppeteer();
  let success = await launchPuppeteer();
  await Login_facebook(success);
}
async function Login_facebook(success) {
  //Login User!
  if (success !== true) {
    console.log("add Accout FB err!");
    return false;
  }
  var login = [];
  var usernotCookie = await user_ppt.getFBnotCookie();
  console.log("usernotCookie: ", usernotCookie[0]);
  if (
    usernotCookie[0] !== undefined &&
    usernotCookie.length > 0 &&
    usernotCookie[0] !== false
  ) {
    console.log("start loginfacebookwithUser");
    login = await loginfacebookwithUser(
      usernotCookie[0].user_name,
      usernotCookie[0].password
    );
  } else {
    do {
      login = await loginwebFBwithCookie();
      console.log("login: ", login);
    } while (login === 2);
  }
  if (login === false || login === [] || login === "" || login === undefined) {
    //await listfb();//thay doi list account fb
    console.log("Login Facebook failed!");
    return await closePuppeteer();
  }
  console.log("Login Facebook Success!");
}
module.exports = {
  Login_facebook: Login_facebook,
  loginfacebookwithUser: loginfacebookwithUser,
  loginwebFBwithCookie: loginwebFBwithCookie,
  getfacebookUID: getfacebookUID,
  getFriendsFb: getFriendsFb,
  getfollowingFb: getfollowingFb,
  getPagesFbUID: getPagesFbUID,
  getContentSTTFbUID: getContentSTTFbUID,
  getUIDBylinkSTT: getUIDBylinkSTT,
  getMembersGroup: getMembersGroup,
  getGroupsOfPages: getGroupsOfPages,
  getSubGroupsOGroups: getSubGroupsOGroups,
  getLinkVideoFB: getLinkVideoFB,
  UIDsigninGroups: UIDsigninGroups,
  launchPuppeteer: launchPuppeteer,
  closePuppeteer: closePuppeteer,
  fillContentSTTbyKeys: fillContentSTTbyKeys,
  fillbyTrain: fillbyTrain,
  searchPagesOrgroups: searchPagesOrgroups,
  searchSTTContents: searchSTTContents,
  searchSTTContentsinUID: searchSTTContentsinUID,
  getContentsCmtShare: getContentsCmtShare,
  getContentsLike: getContentsLike,
  deleteCookiesInPPT: deleteCookiesInPPT,
};
