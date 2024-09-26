import html2canvas from "html2canvas";
import mermaid, { MermaidConfig, RenderResult } from "mermaid";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import svgPanZoom from "svg-pan-zoom";
import styles from './MermaidRenderer.module.css';


const mermaidConfig: MermaidConfig = {
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    flowchart: {},
    sequence: {},
    pie: {},
};

const svgPanZoomConfig: SvgPanZoom.Options = {
    panEnabled: true,
    zoomEnabled: true,
    fit: true,
    center: true,
    minZoom: 0.5,
    maxZoom: 5,
    zoomScaleSensitivity: 0.1,
    dblClickZoomEnabled: true,
    preventMouseEventsDefault: true,
};

mermaid.initialize(mermaidConfig);

export interface MermaidRendererProps {
    graphText: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ graphText }) => {
    const [chart, setChart] = useState<string | null>(null);
    const [isLoading, setLoading] = useState<boolean>(true);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const svgContainerRef = useRef<HTMLDivElement | null>(null);
    const panAndZoomInstanceRef = useRef<SvgPanZoom.Instance | null>(null);

    const renderGraph = useCallback(async () => {
        try {
            const isChartValid = await mermaid.parse(graphText);
            if (!isChartValid) throw new Error("Invalid chart"); 
            const { svg: svgCode }: RenderResult = await mermaid.render("id", graphText);
            setChart(svgCode);
        } catch (error) {
            // TODO: Handle your custom error
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [graphText]);

    const applyPanAndZoom = useCallback(() => {
        if (containerRef.current && chart) {
            const svgElement = containerRef.current.querySelector("svg");
            if (svgElement) {
                const panZoomInstance = svgPanZoom(svgElement, svgPanZoomConfig);
                panAndZoomInstanceRef.current = panZoomInstance;
            }
        }
    }, [chart]);

    const resetPanAndZoom = useCallback(() => {
        const panZoomInstance = panAndZoomInstanceRef.current;
        if (chart && panZoomInstance) {
            panZoomInstance.reset();
        }
    }, [chart]);

    const downloadByDataUrl = useCallback((dataUrl: string, name: string = "graph") => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${name}.png`;
        link.click();
    }, []);

    const downloadGraph = useCallback(async () => {
        resetPanAndZoom();
        if (svgContainerRef.current && chart) {
            const canvas = await html2canvas((svgContainerRef.current as HTMLElement), { backgroundColor: 'transparent' });
            if (canvas) {
                const dataUrl = canvas.toDataURL("image/png");
                downloadByDataUrl(dataUrl);
            }
        }

    }, [chart, downloadByDataUrl, resetPanAndZoom]);

    useLayoutEffect(() => {
        renderGraph();
    }, [renderGraph]);

    useLayoutEffect(() => {
        applyPanAndZoom();
    }, [applyPanAndZoom]);

    return (
        <div className={styles.container} ref={containerRef}>
            <div className={styles.header}>
                <div>
                <h1>Mermaid + ReactJS Integration</h1>
                <p>Use your mouse to move around</p>
                </div>
                <button onClick={downloadGraph} className={styles.downloadButton}>Download</button>
                <button onClick={resetPanAndZoom} className={styles.downloadButton}>Reset</button>
            </div>
           { isLoading ? <div>Loading...</div> :
            <div className={styles.svgContainer} ref={svgContainerRef} dangerouslySetInnerHTML={{__html: chart ?? ""}} />}
        </div>
    )
}