<?php
//$_POST['q'] = "月。\r\n私の名前は川崎です。";
//$_POST = $_GET;
$cache = true;
$saveTo = './cache/' . md5($_POST['q']) . '.json';
if ($cache && file_exists($saveTo)) {
    echo file_get_contents($saveTo);
    exit();
}
$ch = curl_init();
$options = array(
    CURLOPT_HEADER => false,
    CURLOPT_POST => 1,
    CURLOPT_URL => 'http://www.kawa.net/works/ajax/romanize/romanize.cgi',
    CURLOPT_POSTFIELDS => ['mode' => 'japanese', 'q' => $_POST['q']],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    // CURLOPT_PROXYAUTH => CURLAUTH_BASIC,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    // CURLOPT_PROXY => "127.0.0.1",
    // CURLOPT_PROXYPORT => 1080,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36 Edg/81.0.416.58',
);
curl_setopt_array($ch, $options);
$content = curl_exec($ch);
curl_close($ch);
$res = [
    'index' => $_POST['i'],
    'res' => [],
];
foreach (getStringByStartAndEnd_array($content, '<li>', '</li>') as $value) {
    foreach (getStringByStartAndEnd_array($value, '<span', '/span>') as $value1) {
        $res['res'][] = [
            getStringByStartAndEnd($value1, '>', '<'),
            getStringByStartAndEnd($value1, 'title="', '"'),
        ];
    }
}
// var_dump($res);
$res = json_encode($res);
if ($cache && count($res) > 0) {
    @mkdir('./cache/', 0777);
    file_put_contents($saveTo, $res);
}
echo $res;

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
    while (true) {
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
