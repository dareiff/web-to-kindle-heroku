const express = require("express");
const path = require("path");
const puppeteer = require("puppeteer-core");
const execFile = require("child_process").execFile;
const fs = require("fs");

const PORT = process.env.PORT || 3003;

express()
    .use(express.static(path.join(__dirname, "public")))
    .set("views", path.join(__dirname, "views"))
    .set("view engine", "ejs")
    .get("/", async (req, res) => {
        const browser = await puppeteer.launch({
            executablePath: "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 600, height: 800 });
        await page.goto(
            process.env.SCREENSHOT_URL || "https://home-ui.vercel.app/",
            { waitUntil: "networkidle0" }
        );
        await page.screenshot({
            path: "/tmp/screenshot.png",
            waitUntil: "networkidle0",
        });

        await browser.close();

        try {
            await convert("/tmp/screenshot.png");
        } catch (error) {
            console.error(error);
        }
        screenshot = fs.readFileSync("/tmp/screenshot.png");

        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": screenshot.length,
        });
        return res.end(screenshot);
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

function convert(filename) {
    return new Promise((resolve, reject) => {
        const args = [
            filename,
            "-gravity",
            "center",
            "-resize",
            "1200x1600",
            "-colorspace",
            "gray",
            "-depth",
            "8",
            filename,
        ];
        execFile("convert", args, (error, stdout, stderr) => {
            if (error) {
                console.error({ error, stdout, stderr });
                reject();
            } else {
                resolve();
            }
        });
    });
}
