using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Service.ERackOperationService;
using garmit.Core;
using garmit.Web.Models;
using garmit.Web.Accessor;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 電気錠設定画面のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/ElectricLockOperation")]
    public class ElectricLockOperationApiController : ApiController
    {
        public IERackOperationService ERackOperationService { get; set; }

        public ElectricLockOperationApiController()
        {
            ERackOperationService = ServiceManager.GetService<IERackOperationService>("ERackOperationService");
        }

        /// <summary>
        /// マスターデータを取得する
        /// </summary>
        /// <returns></returns>
        [Route("")]
        public LookUp GetLookUp()
        {
            Session session = SessionAccessor.GetSession();
            ERackOperationInfo info = new ERackOperationInfo();

            try
            {
                info = ERackOperationService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.LookUp;
        }

        /// <summary>
        /// 電気錠設定一覧を返却する（検索結果）
        /// </summary>
        /// <param name="lookUp"></param>
        /// <returns></returns>
        [Route("getERackList")]
        public SearchResult PostERackResult(LookUp lookUp)
        {
            Session session = SessionAccessor.GetSession();
            ERackOperationInfo info = new ERackOperationInfo();

            try
            {
                info = ERackOperationService.GetERackList(session, lookUp);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.ERackResult;
        }

        /// <summary>
        /// ラックを施錠する
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns></returns>
        [Route("lockRacks")]
        public RequestResult PostLockRacks(ElectricLockOperationQueryParameter parameter)
        {
            Session session = SessionAccessor.GetSession();
            ERackOperationInfo info = new ERackOperationInfo();

            try
            {
                info = ERackOperationService.LockRacks(session, parameter.LocationIds, parameter.Front, parameter.Rear, parameter.Memo, parameter.ExtendedPages);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// ラックを開錠する
        /// </summary>
        /// <returns></returns>
        [Route("unlockRacks")]
        public RequestResult PostUnlockRacks(ElectricLockOperationQueryParameter parameter)
        {
            Session session = SessionAccessor.GetSession();
            ERackOperationInfo info = new ERackOperationInfo();

            try
            {
                info = ERackOperationService.UnlockRacks(session, parameter.LocationIds, parameter.Front, parameter.Rear, parameter.Memo, parameter.Purpose, parameter.ExtendedPages);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }
    }
}
