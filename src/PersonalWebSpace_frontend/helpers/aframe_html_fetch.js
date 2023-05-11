console.log("################################");
export let response;
response = await fetch("http://172.30.127.239:3000/#/space/0");
console.log("response");
console.log(response);
console.log(response.body);
console.log(response.bodyUsed);
const responseText = await response.text();
console.log(responseText);
/* await setTimeout(() => {
	let iframeElement = document.getElementById("html-fetch-iframe");
	console.log("iframeElement");
	console.log(iframeElement);
	document.getElementById("html-fetch-iframe").innerHTML = responseText;
}, 5000); */