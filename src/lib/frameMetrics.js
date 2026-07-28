const WINDOW_MS = 15_000;

export function createFrameMetrics(panel) {
    let previousFrame = 0;
    let nextReport = performance.now() + WINDOW_MS;
    let samples = [];

    return {
        reset(now = performance.now()) {
            previousFrame = 0;
            nextReport = now + WINDOW_MS;
            samples = [];
        },
        record(now) {
            if (previousFrame) samples.push({ at: now, duration: now - previousFrame });
            previousFrame = now;

            if (now < nextReport) return;

            const cutoff = now - WINDOW_MS;
            samples = samples.filter((sample) => sample.at >= cutoff);
            const durations = samples.map((sample) => sample.duration).sort((a, b) => a - b);
            const averageFrameTime = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
            const p99FrameTime = durations[Math.min(durations.length - 1, Math.ceil(durations.length * 0.99) - 1)];

            console.log(`[${panel}] 15-second frame metrics`, {
                frameCount: durations.length,
                averageFrameTimeMs: Number(averageFrameTime.toFixed(2)),
                p99FrameTimeMs: Number(p99FrameTime.toFixed(2)),
                averageFps: Number((1000 / averageFrameTime).toFixed(2)),
            });

            nextReport = now + WINDOW_MS;
        },
    };
}
