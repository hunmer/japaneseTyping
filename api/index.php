<?php

header("Access-Control-Allow-Origin: *");

$GLOBALS['res'] = [];
$type = getParam('type');
$url = getParam('param');

// $type = 'getFavorite';
$data = [];
$cookie = '';
$cache = 1;
switch ($type) {

    case 'getFavorite':
        $url = 'https://syosetu.com/favnovelmain/isnoticelist/';
        $cookie = 'ses=KnMZoUhsN4smmp2ouOGdU2;userl=2122745%3C%3Ebdb71adf9311b9827cbbc0695b297b0eaf1bf8e2475ea2d8141e3567c2afe094';
        $func = function ($content) {
            foreach (getStringByStartAndEnd_array($content, '<form method="post"', '</form>') as $detail) {
                $arr = explode('">', getStringByStartAndEnd($detail, '<a class="title" href="', '</a>'));
                $GLOBALS['res']['list'][] = [
                    'title' => $arr[1],
                    'url' => $arr[0],
                    'author' => trim(getStringByStartAndEnd($detail, '<span class="fn_name">', '</span>')),
                    'time' => trim(getStringByStartAndEnd($detail, '更新日：', "<span ")),
                    'all' => getStringByStartAndEnd($detail, '最新', '部分'),
                ];
            }
        };
        break;
    case 'login':
        $url = 'https://ssl.syosetu.com/login/login/';
        $data = [
            'narouid' => 'liaoyanjie2000@gmail.com',
            'pass' => 'liaoyanjie1312',
        ];
        $func = function ($cookie) {
            $GLOBALS['res'] = [
                'cookie' => $cookie,
            ];
        };
        break;
    case 'list':
        //$url = 'https://ncode.syosetu.com/n1386gb/';
        $func = function ($content) {
            $arr = explode('">', str_replace('作者：<a href="', '', getStringByStartAndEnd($content, '<div class="novel_writername">', '</a>')));
            $GLOBALS['res'] = [
                'title' => getStringByStartAndEnd($content, '<p class="novel_title">', '</p>'),
                'author' => [
                    'name' => $arr[1],
                    'homePage' => $arr[0],
                ],
                'desc' => getStringByStartAndEnd($content, '<div id="novel_ex">', '</div>'),
                'list' => [],
            ];
            foreach (getStringByStartAndEnd_array($content, '<dl class="novel_sublist2">', '</dl>') as $sublist) {
                $arr = explode('">', str_replace('<a href="', '', getStringByStartAndEnd($sublist, '<dd class="subtitle">', '</a>')));
                $GLOBALS['res']['list'][] = [
                    'title' => $arr[1],
                    'url' => 'https://ncode.syosetu.com' . trim($arr[0]),
                    'time' => getStringByStartAndEnd($sublist, '<dt class="long_update">', '<'),
                ];
            }
        };
        break;

    case 'content':
        // $url = 'https://ncode.syosetu.com/n1386gb/4/';
        $func = function ($content) {
            $arr = explode('">', str_replace('<a href="', '', getStringByStartAndEnd(getStringByStartAndEnd($content, '<div class="contents1">', '</div>'), '作者：', '</a>')));

            $s = getStringByStartAndEnd($content, '<div class="novel_bn">', '</div>');
            $arr1 = getStringByStartAndEnd_array($s, 'href="', '"');
            if (count($arr1) == 1) {
                if (strpos($s, '次へ') != false) {
                    // 第一页
                    array_unshift($arr1, ''); // 前面插入
                    $homePage = $arr1[1];
                } else {
                    $arr1[1] = '';
                    $homePage = $arr1[0];
                }
            } else {
                $homePage = $arr1[0];
            }
            $GLOBALS['res'] = [
                'novel' => getStringByStartAndEnd($content, 'class="margin_r20">', '</a>'),
                'homePage' => 'https://ncode.syosetu.com/' . explode('/', $homePage)[1] . '/',
                'title' => getStringByStartAndEnd($content, '<p class="novel_subtitle">', '</p>'),
                'author' => [
                    'name' => $arr[1],
                    'homePage' => $arr[0],
                ],
                'prev' => $arr1[0] ? 'https://ncode.syosetu.com' . $arr1[0] : '',
                'next' => $arr1[1] ? 'https://ncode.syosetu.com' . $arr1[1] : '',
                'list' => getStringByStartAndEnd($content, '<div id="novel_no">', '</div>'),
                'content' => delhtml(getStringByStartAndEnd($content, '<div id="novel_honbun" class="novel_view">', '</div>')),
            ];
        };
        break;

    default:
        exit;
}

$saveTo = './cache/' . base64_encode($url) . '.json';
if ($cache && file_exists($saveTo)) {
    echo file_get_contents($saveTo);
    exit();
}
$ch = curl_init();
$options = array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_URL => $url,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_COOKIE => $cookie,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_PROXYAUTH => CURLAUTH_BASIC,
    CURLOPT_PROXY => "127.0.0.1",
    CURLOPT_PROXYPORT => 1080,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36 Edg/81.0.416.58',
);
if (count($data) > 0) {
    $options[CURLOPT_HEADER] = true;
    $options[CURLOPT_POST] = true;
    $options[CURLOPT_POSTFIELDS] = http_build_query($data);
}
curl_setopt_array($ch, $options);
$content = curl_exec($ch);

if (count($data) > 0) {
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $header = substr($content, 0, $headerSize);
    $cookie = '';
    foreach (getStringByStartAndEnd_array($header, 'Set-Cookie: ', "\r\n") as $cookies) {
        $cookie .= explode(';', $cookies)[0] . ';';
    }
    $content = $cookie;
}

curl_close($ch);
$func($content);

$res = json_encode($GLOBALS['res']);
//if($cache){
if (!is_null($res['novel'])) {
    @mkdir('./cache/', 0777);
    file_put_contents($saveTo, $res);
}
//}
echo $res;

function delhtml($str)
{
    //清除html标签
    $str = htmlspecialchars_decode($str);
    $str = preg_replace("/<(.*?)>/", "", $str);
    return $str;
}

function getParam($key, $default = '')
{
    return trim($key && is_string($key) ? (isset($_POST[$key]) ? $_POST[$key] : (isset($_GET[$key]) ? $_GET[$key] : $default)) : $default);
}

function getStringByStartAndEnd($s_text, $s_start, $s_end, $i_start = 0, $b_end = false)
{
    if (($i_start = strpos($s_text, $s_start, $i_start)) !== false) {
        if (($i_end = strpos($s_text, $s_end, $i_start + strlen($s_start))) === false) {
            if ($b_end) {
                $i_end = strlen($s_text);
            } else {
                return;
            }
        }
        return substr($s_text, $i_start + strlen($s_start), $i_end - $i_start - strlen($s_start));
    }
}

function getStringByStartAndEnd_array($s_text, $s_start, $s_end, $i_start = 0)
{
    $res = [];
    while (1) {
        if (($i_start = strpos($s_text, $s_start, $i_start)) !== false) {
            if (($i_end = strpos($s_text, $s_end, $i_start + strlen($s_start))) !== false) {
                $res[] = substr($s_text, $i_start + strlen($s_start), $i_end - $i_start - strlen($s_start));
                $i_start = $i_end + strlen($s_end);
                continue;
            }
        }
        break;
    }
    return $res;
}
