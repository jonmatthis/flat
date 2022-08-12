import { FlatI18n } from "@netless/flat-i18n";
import { FlatServiceProviderFile, FlatServices, Toaster } from "@netless/flat-services";
import { message } from "antd";
import { Remitter } from "remitter";

export function initFlatServices(): void {
    const toaster = createToaster();
    const flatI18n = FlatI18n.getInstance();

    const flatServices = FlatServices.getInstance();

    flatServices.register(
        "file",
        async () => new FlatServiceProviderFile(flatServices, toaster, flatI18n),
    );

    flatServices.register("videoChat", async () => {
        const { AgoraRTCWeb } = await import("@netless/flat-service-provider-agora-rtc-web");
        return new AgoraRTCWeb({ APP_ID: process.env.AGORA_APP_ID });
    });

    flatServices.register("textChat", async () => {
        const { AgoraRTM } = await import("@netless/flat-service-provider-agora-rtm");
        AgoraRTM.APP_ID = process.env.AGORA_APP_ID;
        return AgoraRTM.getInstance();
    });

    flatServices.register("whiteboard", async () => {
        const { Fastboard } = await import("@netless/flat-service-provider-fastboard");
        return new Fastboard({
            APP_ID: process.env.NETLESS_APP_IDENTIFIER,
            toaster,
            flatI18n,
            flatInfo: {
                platform: "web",
                ua: process.env.FLAT_UA,
                region: process.env.FLAT_REGION,
                version: process.env.VERSION,
            },
        });
    });

    flatServices.register(
        [
            "file-convert:doc",
            "file-convert:docx",
            "file-convert:ppt",
            "file-convert:pptx",
            "file-convert:pdf",
        ],
        async () => {
            const { FileConvertNetless } = await import(
                "@netless/flat-service-provider-file-convert-netless"
            );
            return new FileConvertNetless();
        },
    );

    flatServices.register("file-convert:ice", async () => {
        const { FileConvertH5 } = await import("@netless/flat-service-provider-file-convert-h5");
        return new FileConvertH5();
    });
}

function createToaster(): Toaster {
    const toaster: Toaster = new Remitter();
    toaster.on("info", info => message.info(info));
    toaster.on("error", error => message.error(error));
    toaster.on("warn", warn => message.warn(warn));
    return toaster;
}