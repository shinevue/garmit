using garmit.Core;
using garmit.DomainObject;
using garmit.Service.ElectricLockMapService;
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
    /// 電気錠マップAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/electricLockMap")]
    public class ElectricLockMapApiController : ApiController
    {

        /// <summary>
        /// 電気錠マップサービス
        /// </summary>
        public IElectricLockMapService ElectricLockMapService { get; set; }

        /// <summary>
        /// コンストラクタ
        /// </summary>
        public ElectricLockMapApiController()
        {
            ElectricLockMapService = ServiceManager.GetService<IElectricLockMapService>("ElectricLockMapService");
        }

        /// <summary>
		/// 初期表示情報取得
		/// </summary>
		/// <returns></returns>
		[Route("getLookUp")]
        public ElectricLockMapInfo GetLookUp()
        {
            ElectricLockMapInfo info = new ElectricLockMapInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ElectricLockMapService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }
            return info;
        }

        /// <summary>
		/// 電気錠用のフロアマップを取得する
		/// </summary>
		/// <param name="layoutId">レイアウトID</param>
		/// <returns></returns>
		[Route("layout")]
        public Layout PostGetLayout(IdIntegerQueryParameter param)
        {
            ElectricLockMapInfo info = new ElectricLockMapInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ElectricLockMapService.GetLayout(session, param.Id);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }
            return info.Layout;
        }

        /// <summary>
        /// 電気錠マップ表示用の電気錠ラック情報を取得する
        /// </summary>
        /// <param name="locationIds"></param>
        /// <returns></returns>
        [Route("electricLockRacks")]
        public IEnumerable<ElectricLockRackDispItem> PostGetElectricLockRacks(IEnumerable<int> locationIds)
        {
            ElectricLockMapInfo info = new ElectricLockMapInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ElectricLockMapService.GetElectricLockRacks(session, locationIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info = null;
            }
            return info.ElectricLockRacks;
        }

        /// <summary>
        /// 電気錠情報一覧を取得する
        /// </summary>
        /// <param name="locationIds"></param>
        /// <returns></returns>
        [Route("getElectricLocks")]
        public IEnumerable<ElectricLock> PostGetElectricLocks(IEnumerable<int> locationIds)
        {
            IEnumerable<ElectricLock> locks = new List<ElectricLock>();
            Session session = SessionAccessor.GetSession();
            try
            {
                locks = ElectricLockMapService.GetElectricLocks(session, locationIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                locks = null;
            }
            return locks;
        }
        
    }
}
