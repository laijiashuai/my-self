const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// 代理接口：/api/douyin/:userId
app.get('/api/douyin/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const url = `https://www.douyin.com/user/${userId}`;

        console.log(`正在获取: ${url}`);

        // 请求抖音页面
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Cookie': 'douyin.com; device_web_cpu_core=12; device_web_memory_size=16; architecture=amd64; enter_pc_once=1; UIFID_TEMP=e8af8eec168e6006bb749042c72c8d2abad7941d853b8500624783ee98d61da69c2d04abe83d86b0157a6d9c30d270b0d9f9adecb0cd1fddd0d70e1ece4317030f511f6ce1e6884274740f79c8bf5988; x- web - secsdk - uid=82158f1c - a55f - 457d- bcb8 - fbfeafa6a127; s_v_web_id = verify_mq2ef8b6_c3CKPEhh_Pr3O_4tQo_AWb9_DnX8VNSXzPtA; is_support_rtm_web_ts = 1; hevc_supported = true; dy_swidth = 2560; dy_sheight = 1440; strategyABtestKey =% 221780753381.396 % 22; fpk1 = U2FsdGVkX1 + x8 + 9WoWW2yj / HlStdtt73Nuq8LvixIsdH1qy0pyZFmC7yv + 9ZdN4tDpdq / 9j43v0NOJmqO7z + GQ ==; fpk2 = 90daa551604269dbcdcf237b5cc700f3; passport_csrf_token = 22c74a337267d7006f50be31f57c19a8; passport_csrf_token_default = 22c74a337267d7006f50be31f57c19a8; bd_ticket_guard_client_web_domain = 2; SEARCH_UN_LOGIN_PV_CURR_DAY =% 7B % 22date % 22 % 3A1780753407472 % 2C % 22count % 22 % 3A2 % 7D; passport_mfa_token = CjXYaYHp19wBZIl0zrcMmxDIdzgV1IqiVb % 2Bht7Coqa0sEDruHQYeQvBEvgVYgRIw5tIa8uLTGxpKCjwAAAAAAAAAAAAAUIJuNoucaTjN71ryypqJH1Pe9S0V % 2BfYYVAQC % 2Fspz3tN5UJkvVX4P7qqmFnxU9yI68JkQ8rqTDhj2sdFsIAIiAQNlogJB; d_ticket = 25d40c086533455db85512d510a4eeaa36312; passport_auth_status = a2f983921d9ee503b4b5c270100024b6 % 2C; passport_auth_status_ss = a2f983921d9ee503b4b5c270100024b6 % 2C; is_staff_user = false; has_biz_token = false; __security_server_data_status = 1; SEARCH_RESULT_LIST_TYPE =% 22single % 22; csrf_session_id = 82b045973abb0ba25dae051a963b90ea; FOLLOW_LIVE_POINT_INFO =% 22MS4wLjABAAAAYLVzofvsSh9Whf4VPeVXU6HB8oG1vW1hnCk7z1lJbyM % 2F1780761600000 % 2F0 % 2F1780753442617 % 2F0 % 22; publish_badge_show_info =% 220 % 2C0 % 2C0 % 2C1780753443221 % 22; UIFID = e8af8eec168e6006bb749042c72c8d2abad7941d853b8500624783ee98d61da6dbeeecaba97ce5fd4fef9f22e3bda6d7df8ccf241fe6b018576b7cb0d14c57547d1916a81c5fd575eaa4fbf71ff5a2c276f1147b74ca42121296da4ff2a34f423e7e927df69d275c31a9dcbc2db9991cd13522c039f842516705ac72b3bcd5e04ff7d08afa1ccf8d793dcb163b0503a44741e127ff818f59acd4ced4ee6fc207; my_rd = 2; is_dash_user = 1; n_mh = 9 - mIeuD4wZnlYrrOvfzG3MuT6aQmCUtmr8FxV8Kl8xY; _bd_ticket_crypt_cookie = 62e14a0f9f659250c9d71b4b9165e9b1; __security_mc_1_s_sdk_sign_data_key_web_protect = e8e486da - 430c - 9d29; __security_mc_1_s_sdk_cert_key = c7334fbc - 4153 - b007; __security_mc_1_s_sdk_crypt_sdk = 5c05b103 - 439d - b4e0; SelfTabRedDotControl =% 5B % 5D; download_guide =% 223 % 2F20260606 % 2F0 % 22; FOLLOW_NUMBER_YELLOW_POINT_INFO =% 22MS4wLjABAAAA73ORY7cD2_bw5dkwqXFxtQxbY7fuAdoYS1Palc8yX_Sh7zpJcKJ8wY904uqc0eoL % 2F1780761600000 % 2F0 % 2F1780759546199 % 2F0 % 22; stream_recommend_feed_params =% 22 % 7B % 5C % 22cookie_enabled % 5C % 22 % 3Atrue % 2C % 5C % 22screen_width % 5C % 22 % 3A2560 % 2C % 5C % 22screen_height % 5C % 22 % 3A1440 % 2C % 5C % 22browser_online % 5C % 22 % 3Atrue % 2C % 5C % 22cpu_core_num % 5C % 22 % 3A12 % 2C % 5C % 22device_memory % 5C % 22 % 3A16 % 2C % 5C % 22downlink % 5C % 22 % 3A3.5 % 2C % 5C % 22effective_type % 5C % 22 % 3A % 5C % 224g % 5C % 22 % 2C % 5C % 22round_trip_time % 5C % 22 % 3A50 % 7D % 22; login_time = 1780759710183; sid_guard = 50a693c983f09fed963302d561fd3f75 % 7C1780759710 % 7C21600 % 7CSat % 2C +06 - Jun - 2026 + 21 % 3A28 % 3A30 + GMT; uid_tt = 7e52dd900776929da74ddd5a7eeaa380; uid_tt_ss = 7e52dd900776929da74ddd5a7eeaa380; sid_tt = 50a693c983f09fed963302d561fd3f75; sessionid = 50a693c983f09fed963302d561fd3f75; sessionid_ss = 50a693c983f09fed963302d561fd3f75; session_tlb_tag = sttt % 7C19 % 7CUKaTyYPwn - 2WMwLVYf0_df________ - tOia9tOLAkYHufiulzIYjJLUi - pBYpPpyFV7DcQOBRlM % 3D; sid_ucp_v1 = 1.0.0 - KDM4MGY0MWE5MzA5ZWNlMWJkMDcwMzcxY2FmNTJhMDA3MDNkZmE4YTcKCRCe - ZDRBhjvMRoCbGYiIDUwYTY5M2M5ODNmMDlmZWQ5NjMzMDJkNTYxZmQzZjc1; ssid_ucp_v1 = 1.0.0 - KDM4MGY0MWE5MzA5ZWNlMWJkMDcwMzcxY2FmNTJhMDA3MDNkZmE4YTcKCRCe - ZDRBhjvMRoCbGYiIDUwYTY5M2M5ODNmMDlmZWQ5NjMzMDJkNTYxZmQzZjc1; odin_tt = 7aa2c87dfa8a8c4ae96b8dea7fad157df4d5afcfa934abcdd4619b37cf6786239b7259d53482f29826e839648dccd873fe15dacbecdfeccb6d07d11ae116efab14dcd27a6232842a28d0bd19accf5a10; __ac_nonce =06a244154004e72a2e51; __ac_signature = _02B4Z6wo00f0144Kv6gAAIDA0Z - 0ZdVWC3OOKrsAAImv98; home_can_add_dy_2_desktop =% 221 % 22; bd_ticket_guard_client_data = eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJiZC10aWNrZXQtZ3VhcmQtcmVlLXB1YmxpYy1rZXkiOiJCRExicWpYbUJ3OFA3MUszbFRqQnBuL2hZM01GanM2RlRvR2lZVkNHRVBwSnN0QU54Yk1BbWtyV0QvdmhEeDVKL1dqK3V2NnpkRm1qQjY4eTFrSkZrMDA9IiwiYmQtdGlja2V0LWd1YXJkLXdlYi12ZXJzaW9uIjoyfQ % 3D % 3D; biz_trace_id = 44b7d64f; bd_ticket_guard_client_data_v2 = eyJyZWVfcHVibGljX2tleSI6IkJETGJxalhtQnc4UDcxSzNsVGpCcG4vaFkzTUZqczZGVG9HaVlWQ0dFUHBKc3RBTnhiTUFta3JXRC92aER4NUovV2ordXY2emRGbWpCNjh5MWtKRmswMD0iLCJ0c19zaWduIjoidHMuMi5jOWNiMmYwNmI2MDBlMTI3YWUwMDcxYmUzMjgzMGZkMDJlY2RmMzcxZTk2ZTAxN2RlMTU3NmY4MWExNjAwYzNhYzRmYmU4N2QyMzE5Y2YwNTMxODYyNGNlZGExNDkxMWNhNDA2ZGVkYmViZWRkYjJlMzBmY2U4ZDRmYTAyNTc1ZCIsInJlcV9jb250ZW50Ijoic2VjX3RzIiwicmVxX3NpZ24iOiJadjFBRkxRUjl3LzJOK3o3ckd0QWdUOVp5dk9YaUFFNzA1cm5vL282OGVvPSIsInNlY190cyI6IiNSbkRIUmN1K3lLQmF6dEtJa3lHTndNM2JFMU8yNXI4THlya2hUYytlREd1MExPanBJOWtqdGxiNDhWZGMifQ % 3D % 3D; ttwid = 1 % 7CELGaUbCQEX_4njS5C1dKQG2wJ2ftLr12sBaTSCinMUE % 7C1780761224 % 7C4f29a07bcdbf804e269d2bb8fc51e21c2028eaf108f91d58420746422736d4d5; IsDouyinActive = false' // ⚠️ 关键，见下方获取方法
            },
            timeout: 10000
        });

        // 用 cheerio 解析 HTML
        const $ = cheerio.load(data);

        let fans = '--';
        let likes = '--';

        // 提取粉丝数：找 "粉丝" 文本，然后取下一个 .KohgbPB2 的内容
        $('.b32SAWob').each((index, element) => {
            const text = $(element).text().trim();

            if (text === '粉丝') {
                // 下一个兄弟元素就是粉丝数
                fans = $(element).next('.KohgbPB2').text().trim() || '--';
            }

            if (text === '获赞') {
                likes = $(element).next('.KohgbPB2').text().trim() || '--';
            }
        });

        console.log(`粉丝: ${fans}, 获赞: ${likes}`);

        res.json({
            success: true,
            data: {
                fans: fans,
                likes: likes
            }
        });

    } catch (err) {
        console.error('获取失败:', err.message);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// 启动服务
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ 代理服务运行在 http://localhost:${PORT}`);
    console.log(`📝 访问 http://localhost:${PORT}/api/douyin/你的UserId`);
});
