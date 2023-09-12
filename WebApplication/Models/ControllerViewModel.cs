using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace garmit.Web.Models
{
    /// <summary>
    /// コントローラで表示するモデル
    /// </summary>
    public class ControllerViewModel
    {
        /// <summary>
        /// 認証されたかどうか
        /// </summary>
        public bool IsSuccess { get; private set; }

        /// <summary>
        /// 機能名称
        /// </summary>
        public string FunctionName { get; private set; }

        /// <summary>
        /// アイコンクラス
        /// </summary>
        public string IconClass { get; private set; }
        
        /// <summary>
        /// 画面遷移時のアクション名
        /// </summary>
        public string ActionName { get; private set; }

        /// <summary>
        /// 画面遷移時のコントローラ名
        /// </summary>
        public string ControllerName { get; private set; }

        /// <summary>
        /// 画面に渡すデータ（TempData）
        /// </summary>
        public TempDataDictionary TempData { get; private set; }

        /// <summary>
        /// 画面に渡すデータ（ViewBag）
        /// </summary>
        public dynamic ViewBag { get; private set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        /// <param name="functionId">機能ID</param>
        public ControllerViewModel(Function.FUNCTION_ID_e functionId)
        {
            Initialization(functionId);
        }

        /// <summary>
        /// 初期化
        /// </summary>
        /// <param name="functionId">機能ID</param>
        private void Initialization(Function.FUNCTION_ID_e functionId)
        {
            IsSuccess = false;
            ControllerName = "Error";
            TempData = new TempDataDictionary();
            AuthenticationInfo authInfo = Accessor.AuthenticationAccessor.GetAuthenticationInfo(functionId);

            if (authInfo == null)
            {
                ActionName = "Index";
            }
            else if (!authInfo.RequestResult.IsSuccess)
            {
                ActionName = "LoginAuthError";
                TempData.Add("Message", authInfo.RequestResult.Message);
            }
            else if (authInfo.RequestResult.IsSuccess &&
                     authInfo.Function.AllowTypeNo == Accessor.AuthenticationAccessor.CST_AUTHTYPE_HIDE)
            {
                ActionName = "AuthError";
                TempData.Add("DisplayName", authInfo.Function.Name);
            }
            else
            {
                IsSuccess = true;
                FunctionName = authInfo.Function.Name;
                IconClass = authInfo.IconClass;
                ControllerName = null;
            }
        }
    }
}