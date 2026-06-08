// config.js — 全局配置管理
const ConfigManager = (() => {
    let cachedConfig = null;
    let isLoading = false;

    async function loadConfig(force = false) {
        // 命中缓存且不强制刷新
        if (cachedConfig && !force) return cachedConfig;

        // 防止重复请求
        if (isLoading) {
            await new Promise(resolve => {
                const check = setInterval(() => {
                    if (!isLoading) {
                        clearInterval(check);
                        resolve();
                    }
                }, 50);
            });
            return cachedConfig;
        }

        isLoading = true;

        try {
            const res = await fetch('/server/api/get_apiconf.php?t=' + Date.now());
            const result = await res.json();

            if (result.code !== 0) {
                throw new Error(result.message || '获取配置失败');
            }

            cachedConfig = result.data;
            return cachedConfig;

        } catch (err) {
            console.error('[Config] 加载失败:', err.message);
            return null;

        } finally {
            isLoading = false;
        }
    }

    function getAPIBase() {
        if (!cachedConfig) return '';
        return `http://${cachedConfig.host}:${cachedConfig.port}/api/douyin/`;
    }

    // 公开接口
    return {
        loadConfig,      // 手动加载
        getAPIBase,      // 获取基础 URL
        getConfig: () => cachedConfig  // 获取完整配置
    };
})();
