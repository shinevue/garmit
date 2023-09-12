using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.DomainObject;
using garmit.Service.ExtendedData;
using garmit.Core;
using garmit.Web.Accessor;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    [SessionExpireApiFilter]
    [RoutePrefix("api/extendedData")]
    public class ExtendedDataApiController : ApiController
    {
        /// <summary>
        /// 詳細項目情報サービス
        /// </summary>
        public IExtendedDataService ExtendedDataService { get; set; }

        public ExtendedDataApiController()
        {
            ExtendedDataService = ServiceManager.GetService<IExtendedDataService>("ExtendedDataService");
        }

        // <summary>
        /// ルックアップデータ取得
        /// </summary>
        /// <returns>LookUp ルックアップデータ</returns>
        [Route("")]
        public LookUp GetLookUp()
        {
            ExtendedDataInfo info = new ExtendedDataInfo();
            Session session = SessionAccessor.GetSession();
            try{
                info = ExtendedDataService.GetLookUp(session);
            }
           catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info.LookUp;
        }

        /// <summary>
        /// ラック詳細項目データ取得
        /// </summary>
        /// <returns>ExtendedDataInfo 詳細項目データ</returns>
        [Route("getRack")]
        public ExtendedDataInfo GetRackExtendInfo()
        {
            ExtendedDataInfo info = new ExtendedDataInfo();
            Session session = SessionAccessor.GetSession();
            try{
                info = ExtendedDataService.GetRackExtendedDataInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// ユニット詳細項目データ取得
        /// </summary>
        /// <returns>ExtendedDataInfo 詳細項目データ</returns>
        [Route("getUnit")]
        public ExtendedDataInfo GetUnitExtendInfo()
        {
            ExtendedDataInfo info = new ExtendedDataInfo();
            Session session = SessionAccessor.GetSession();
            try{
                info = ExtendedDataService.GetUnitExtendedDataInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return  info;
        }

        /// <summary>
        /// コンシューマー詳細項目データ取得
        /// </summary>
        /// <returns></returns>
        [Route("getConsumer")]
        public ExtendedDataInfo GetConsumerExtendInfo()
        {
            ExtendedDataInfo info = new ExtendedDataInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ExtendedDataService.GetConsumerExtendedDataInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// 施解錠詳細項目データ取得
        /// </summary>
        /// <returns></returns>
        [Route("getELockOpen")]
        public IEnumerable<ExtendedPage> GetElockOpLogExtendedPages()
        {
            IEnumerable<ExtendedPage> pages = new List<ExtendedPage>();
            Session session = SessionAccessor.GetSession();
            try
            {
                pages = ExtendedDataService.GetElockOpLogExtendedPages(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return pages;
        }

        /// <summary>
        /// 案件詳細項目データ取得
        /// </summary>
        /// <returns></returns>
        [Route("getProject")]
        public ExtendedDataInfo GetProjectExtendInfo()
        {
            ExtendedDataInfo info = new ExtendedDataInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ExtendedDataService.GetProjectExtendedDataInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// 回線詳細項目データ取得
        /// </summary>
        /// <returns></returns>
        [Route("getLine")]
        public ExtendedDataInfo GetLineExtendInfo()
        {
            ExtendedDataInfo info = new ExtendedDataInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ExtendedDataService.GetLineExtendedDataInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// 配線盤詳細項目データ取得
        /// </summary>
        /// <returns></returns>
        [Route("getPatchboard")]
        public ExtendedDataInfo GetPatchboardExtendInfo()
        {
            ExtendedDataInfo info = new ExtendedDataInfo();
            Session session = SessionAccessor.GetSession();
            try
            {
                info = ExtendedDataService.GetPatchboardExtendedDataInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return info;
        }

        /// <summary>
        /// ラック詳細項目保存
        /// </summary>
        /// <returns>ExtendedDataInfo 詳細項目データ</returns>
        [Route("saveRack")]
        public bool SaveRackExtendInfo(ExtendedPage info)
        {
            Session session = SessionAccessor.GetSession();
            bool isSuccess = false;
            try
            {
                isSuccess = ExtendedDataService.SetRackExtendedPage(session, info);
            }
           catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return isSuccess;           
        }

        /// <summary>
        /// ユニット詳細項目保存
        /// </summary>
        /// <returns>ExtendedDataInfo 詳細項目データ</returns>
        [Route("saveUnit")]
        public bool SaveUnitExtendInfo(ExtendedPage info)
        {
            Session session = SessionAccessor.GetSession();
            bool isSuccess = false;
            try
            {
                isSuccess = ExtendedDataService.SetUnitExtendedPage(session, info);
            }
           catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return isSuccess;
        }

        /// <summary>
        /// コンシューマー詳細項目保存
        /// </summary>
        /// <param name="info"></param>
        /// <returns></returns>
        [Route("saveConsumer")]
        public bool SaveConsumerExtendInfo(ExtendedPage info)
        {
            Session session = SessionAccessor.GetSession();
            bool isSuccess = false;
            try
            {
                isSuccess = ExtendedDataService.SetConsumerExtendedPage(session, info);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return isSuccess;
        }

        /// <summary>
        /// 案件詳細項目保存
        /// </summary>
        /// <param name="info"></param>
        /// <returns></returns>
        [Route("saveProject")]
        public bool SaveProjectExtendInfo(ExtendedPage info)
        {
            Session session = SessionAccessor.GetSession();
            bool isSuccess = false;
            try
            {
                isSuccess = ExtendedDataService.SetProjectExtendedPage(session, info);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return isSuccess;
        }

        /// <summary>
        /// 回線詳細項目保存
        /// </summary>
        /// <param name="info"></param>
        /// <returns></returns>
        [Route("saveLine")]
        public bool SaveLineExtendInfo(ExtendedPage info)
        {
            Session session = SessionAccessor.GetSession();
            bool isSuccess = false;
            try
            {
                isSuccess = ExtendedDataService.SetLineExtendedPage(session, info);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return isSuccess;
        }

        /// <summary>
        /// 配線盤詳細項目保存
        /// </summary>
        /// <param name="info"></param>
        /// <returns></returns>
        [Route("savePatchboard")]
        public bool SavePatchboardExtendInfo(ExtendedPage info)
        {
            Session session = SessionAccessor.GetSession();
            bool isSuccess = false;
            try
            {
                isSuccess = ExtendedDataService.SetPatchboardExtendedPage(session, info);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            return isSuccess;
        }
    }
}
