document.addEventListener("DOMContentLoaded", function () {
    let user = prompt("Write your first name:");
    while (!user || user.length < 2) {
        user = prompt("Please write your first name:");
    }

    document.title = "Happy Birthday " + user + "!";
    document.querySelector("h1").textContent = "Happy Birthday " + user + "!";

    const candlesContainer = document.getElementById("candles-container");

    // Function to create and append candles
    function appendCandles(candlesCount = 5) {
        candlesContainer.style.display = "grid";
        candlesContainer.style.gridTemplateColumns = `repeat(${candlesCount}, 1fr)`;
        candlesContainer.style.justifyContent = "center";
        candlesContainer.style.alignItems = "end";
        candlesContainer.style.gap = "5px";

        for (let i = 0; i < candlesCount; i++) {
            const candle = document.createElement("div");
            candle.classList.add("candle");

            // Add flame to each candle
            const candleFlame = document.createElement("div");
            candleFlame.classList.add("flame");
            candle.appendChild(candleFlame);

            candlesContainer.appendChild(candle);
        }
    }

    appendCandles(5);

    const mic = document.getElementById("mic");
    const cursor = document.getElementById("cursor");
    const micInstructions = document.getElementById("micInstructions");
    const cursorInstructions = document.getElementById("cursorInstructions");
    const instructionsContainer = document.querySelector(".instructions-container");

    micInstructions.style.display = "none";
    cursorInstructions.style.display = "none";

    let audioContext;
    let micStream;
    let analyser;
    const blowThreshold = 110;
    let flameOpacity = 1;

    function checkAllCandlesBlownOut() {
        const flames = document.querySelectorAll(".flame");
        return Array.from(flames).every(flame => parseFloat(flame.style.opacity) === 0);
    }

    function playCelebrationVideo() {
        const videoContainer = document.createElement("div");
        videoContainer.id = "video-container";
        videoContainer.style.position = "fixed";
        videoContainer.style.top = "0";
        videoContainer.style.left = "0";
        videoContainer.style.width = "100%";
        videoContainer.style.height = "100%";
        videoContainer.style.backgroundColor = "black";
        videoContainer.style.display = "flex";
        videoContainer.style.alignItems = "center";
        videoContainer.style.justifyContent = "center";
        videoContainer.style.zIndex = "9999";
    
        const video = document.createElement("video");
        video.src = "bensoul-thick-thighs.mp4"; // Updated path
        video.controls = true;
        video.autoplay = true;
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
    
        videoContainer.appendChild(video);
        document.body.appendChild(videoContainer);
    
        // Exit full screen on click
        videoContainer.addEventListener("click", () => {
            video.pause();
            document.body.removeChild(videoContainer);
        });
    }
    

    function monitorCandles() {
        if (checkAllCandlesBlownOut()) {
            setTimeout(playCelebrationVideo, 2000); // Delay of 2 seconds
        } else {
            setTimeout(monitorCandles, 500); // Check every 0.5 seconds
        }
    }

    function startBlowDetection() {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (stream) {
                audioContext = new AudioContext();
                micStream = stream;
                const microphone = audioContext.createMediaStreamSource(stream);

                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                microphone.connect(analyser);

                monitorCandles();
                listenForBlow();
            })
            .catch(function (err) {
                console.error("Error accessing microphone:", err);
            });
    }

    function listenForBlow() {
        const buffer = analyser.frequencyBinCount;
        const data = new Uint8Array(buffer);

        function detectBlow() {
            analyser.getByteFrequencyData(data);

            let amplitudeSum = 0;
            for (let i = 0; i < buffer; i++) {
                amplitudeSum += data[i];
            }
            const averageAmplitude = amplitudeSum / buffer;

            if (averageAmplitude > blowThreshold) {
                flameOpacity -= 0.05;
                if (flameOpacity < 0) {
                    flameOpacity = 0;
                }

                document.querySelectorAll(".flame").forEach((flame) => {
                    flame.style.opacity = flameOpacity;
                });
            }

            requestAnimationFrame(detectBlow);
        }

        detectBlow();
    }

    mic.addEventListener("click", function () {
        micInstructions.style.display = "block";
        cursorInstructions.style.display = "none";
        instructionsContainer.style.display = "none";
        startBlowDetection();
    });

    window.addEventListener("beforeunload", function () {
        if (audioContext) {
            audioContext.close();
            micStream.getTracks().forEach((track) => track.stop());
        }
    });
});
