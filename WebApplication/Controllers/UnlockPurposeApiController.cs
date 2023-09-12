using garmit.Core;
using garmit.DomainObject;
using garmit.Service.UnlockPurposeService;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 開錠目的Apiコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/unlockPurpose")]
    public class UnlockPurposeApiController : ApiController
    {

        /// <summary>
        /// 開錠目的サービスサービス
        /// </summary>
        public IUnlockPurposeService UnlockPurposeService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public UnlockPurposeApiController()
        {
            UnlockPurposeService = ServiceManager.GetService<IUnlockPurposeService>("UnlockPurposeService");
        }

        /// <summary>
        /// 初期表示情報取得
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public IEnumerable<UnlockPurpose> GetUnlockPurposes()
        {
            UnlockPurposeInfo info = new UnlockPurposeInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = UnlockPurposeService.GetUnlockPurposes(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info.UnlockPurposes;
        }

        /// <summary>
        /// 開錠目的を保存する
        /// </summary>
        /// <param name="param">開錠目的情報</param>
        /// <returns>成功/失敗</returns>
        [Route("save")]
        public bool SetUnlockPurpose(UnlockPurposeQueryParameter param)
        {
            UnlockPurposeInfo info = new UnlockPurposeInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = UnlockPurposeService.SetUnlockPurpose(session, param.UnlockPurpose, param.FunctionId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return false;
            }
            return info.IsSuccess;
        }


        /// <summary>
        /// 開錠目的を削除する
        /// </summary>
        /// <param name="param">開錠目的情報</param>
        /// <returns>成功/失敗</returns>
        [Route("delete")]
        [HttpPost]
        public bool PostDeleteUnlockPurpose(UnlockPurposeQueryParameter param)
        {
            UnlockPurposeInfo info = new UnlockPurposeInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = UnlockPurposeService.DeleteUnlockPurpose(session, param.UnlockPurpose, param.FunctionId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return false;
            }
            return info.IsSuccess;
        }
        
    }
    
}
