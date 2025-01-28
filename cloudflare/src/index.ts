export default {
  async fetch(request: Request): Promise<Response> {
    const linuxScriptUrl =
      "https://raw.githubusercontent.com/jfalava/outfitting/refs/heads/main/linux-install-script.sh";
    const windowsScriptUrl =
      "https://raw.githubusercontent.com/jfalava/outfitting/refs/heads/main/windows-install-script.ps1";
    const repoUrl = "https://github.com/jfalava/outfitting";

    const url = new URL(request.url);
    const hostHeader = request.headers.get("Host") || "";

    console.log("Host Header:", hostHeader);

    let scriptUrl: string;
    if (hostHeader.includes("linux.jfa.dev")) {
      scriptUrl = linuxScriptUrl;
    } else if (hostHeader.includes("win.jfa.dev")) {
      scriptUrl = windowsScriptUrl;
    } else {
      return Response.redirect(repoUrl, 302);
    }

    console.log("Script URL:", scriptUrl);

    const response = await fetch(scriptUrl, {
      headers: {
        Accept: "text/plain",
        "User-Agent": "CloudflareWorker",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return new Response(`Failed to fetch the script (${response.status})`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const scriptContent = await response.text();
    const contentType =
      scriptUrl === windowsScriptUrl
        ? "application/x-powershell"
        : "text/x-shellscript";

    console.log("Content-Type:", contentType);

    return new Response(scriptContent, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
