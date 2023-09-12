using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// HTTPエラーメッセージクラス
    /// </summary>
    public class HttpErrorMessage
    {
        public int ErrorCode { get; private set; }
        public string ErrorMessage { get; private set; }
        public string ErrorDetailMessage { get; private set; }

        /// <summary>
        /// HTTPエラーメッセージのコンストラクタ
        /// </summary>
        /// <param name="errorCodeStr">エラーコード文字列</param>
        public HttpErrorMessage(string errorCodeStr)
        {
            SetHttpErrorMessage(errorCodeStr);
        }

        /// <summary>
        /// HTTPエラーメッセージをセットする
        /// </summary>
        /// <param name="errorCodeStr">ステータスコード文字列</param>
        public void SetHttpErrorMessage(string errorCodeStr)
        {
            ErrorCode = GetNumber(errorCodeStr);
            HttpStatusCode code = GetHttpStatusCode(ErrorCode);
            if ((int)ErrorCode >= 400)
            {
                ErrorMessage = Enum.GetName(typeof(HttpStatusCode), code);
                ErrorDetailMessage = GetErrorDetailMessage(code);
            }
            else
            {
                ErrorMessage = "";
                ErrorDetailMessage = "";
            }
        }
        
        /// <summary>
        /// HTTPステータスコードを取得する
        /// </summary>
        /// <param name="statusCodeStr">ステータスコード文字列</param>
        /// <returns></returns>
        private HttpStatusCode GetHttpStatusCode(int statusCode)
        {
            if (Enum.IsDefined(typeof(HttpStatusCode), statusCode)) {
                return (HttpStatusCode)statusCode;
            }
            return HttpStatusCode.OK;
        }

        /// <summary>
        /// Int型に変換する
        /// </summary>
        /// <param name="key">キー</param>
        /// <returns>int型の設定値</returns>
        private int GetNumber(string target)
        {
            int retValue;
            if (!int.TryParse(target, out retValue))
            {
                retValue = 0;
            }            
            return retValue;
        }

        /// <summary>
        /// エラー詳細メッセージを取得する
        /// </summary>
        /// <param name="code">ステータスコード</param>
        /// <returns></returns>
        private string GetErrorDetailMessage(HttpStatusCode code)
        {
            switch (code)
            {
                case HttpStatusCode.BadRequest:
                    return "要求が正しくありません。";
                case HttpStatusCode.Unauthorized:
                    return "正しく認証されていないため、アクセス許可がありません。";
                case HttpStatusCode.Forbidden:
                    return "指定されたページへのアクセス許可がありません。";
                case HttpStatusCode.NotFound:
                    return "指定されたページが見つかりません。";
                case HttpStatusCode.MethodNotAllowed:
                    return "無効なメソッド（HTTP動詞）が使用されているため、ページを表示できません。";
                case HttpStatusCode.NotAcceptable:
                    return "ブラウザに対応している形式でないため、表示できません。";
                case HttpStatusCode.PreconditionFailed:
                    return "サーバー側で適合しない前提条件がクライアント側のヘッダに含まれています。";
                case HttpStatusCode.InternalServerError:
                    return "サーバー内部エラーにより、ページを表示できません。";
                case HttpStatusCode.NotImplemented:
                    return "サーバーでメソッドが実装されていません。";
                case HttpStatusCode.BadGateway:
                    return "不正なゲートウェイです。";
                default:
                    return "";
            }
        }
    }
}