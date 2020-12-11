"use strict";

// TEST When browse back
window.onpageshow = function(event) {
        if (event.persisted) {
                 window.location.reload()
        }
};

window.onload = () => {
  let stream = null;
  let front_camera = true;
  const canvas = document.querySelector('#js-canvas')
  const video = document.querySelector("video")
  const ctx = canvas.getContext('2d')
  // TODO 他の有効なパラメータを調査する.ひとまず、最低限のパラメータをセットする.
  const media_stream_constraints = {
    // フロントカメラをデフォルトとする
    video: { facingMode: "user" },
    // 以下はリアをデフォルトにする場合
    // video: { facingMode: { exact: 'environment'} },
    audio: false
  };
  // QRコード読み取り
  const checkImage = (front_camera) => {
      // 取得している動画をCanvasに描画
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      // Canvasからデータを取得
      const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height)
      // jsQRに渡す
      const qr_code = jsQR(image_data.data, canvas.width, canvas.height)
      // qrコード読み取りイベント待ち
      if (!qr_code) {
        setTimeout(() => { checkImage() }, 200)
      } else {
        // alert(qr_code.data)
        console.log(qr_code.data)
        postQRCode(qr_code.data)
      }
  }


  stopCameraStream()
  callMediaNavigator()
  // カメラの向きを先に変更しておく
  switchCameraSides()

  // button押下時にカメラの向きを変更した際に再度実行する
  document.querySelector('#switch-cam')
          .addEventListener('click', ()=> {
            stopCameraStream()
            callMediaNavigator()
            switchCameraSides()
          })
  // TEST stop Camera stream
  document.querySelector('#stop-cam')
          .addEventListener('click', () => {
            stopCameraStream()
          })

  // TEST method requests HTTPS to HTTP
  function requestHttpsToHttp () {

  }

  function callMediaNavigator () {
    navigator.mediaDevices
      .getUserMedia(media_stream_constraints)
      .then(function(media_stream){
            video.srcObject = setMediaStream(media_stream)
            video.onloadedmetadata = (event) => {
              video.play()
              checkImage()
            };
      })
      .catch(handleMediaStreamError)
  }

  function setMediaStream(media_stream) {
    console.log(media_stream)
    return stream = media_stream;
  }

  // カメラ切り替えイベント時に直前のvideo streamをstopする
  function stopCameraStream (){
    if( stream !== null ){
      console.log(stream)
      stream.getVideoTracks().forEach( (video) => {
        video.stop()
      })
      // 不要となったオブジェクトを一度解放する
      stream.srcObject = null;
    }
  }

  function switchCameraSides(){
    front_camera = !front_camera
    media_stream_constraints.video.facingMode = (front_camera) ? "user" : {exact: "environment"};
  }

  function handleMediaStreamError(error) {
    console.log("navigator.getUserMedia error: ", error)
  }

  function postQRCode (qr_code) {
    const url = "specify your request path"
    let form = document.createElement('form')
    form.setAttribute('action', url)
    form.setAttribute('method', 'POST')
    // var el = document.createElement('meta')
    // el.setAttribute('http-equiv', 'Content-Security-Policy')
    // el.setAttribute('content', 'upgrade-insecure-requests')
    // document.head.append(el)

    let nyk_nyukyosha_id = document.createElement('input')
    nyk_nyukyosha_id.setAttribute('type', 'hidden')
    nyk_nyukyosha_id.setAttribute('name', 'barcode')
    nyk_nyukyosha_id.setAttribute('value', qr_code)

    form.appendChild(nyk_nyukyosha_id)
    // appendしないとchromeだと動かない(mac os)
    $("body").append(form)
    form.submit()
    return
  }
}
