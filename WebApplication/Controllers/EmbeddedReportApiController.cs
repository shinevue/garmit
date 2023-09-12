using garmit.Core;
using garmit.DomainObject;
using garmit.Web.Accessor;
using garmit.Web.Models;
using garmit.Web.Filter;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.Service.EmbeddedReport;
using System.Globalization;

namespace garmit.Web.Controllers
{
    [SessionExpireApiFilter]
    [RoutePrefix("api/embeddedReport")]
    public class EmbeddedReportApiController : ApiController
    {
        /// <summary>
        /// 埋込レポートサービス
        /// </summary>
        IEmbeddedReportService EmbeddedReportService { get; set; }

        public EmbeddedReportApiController()
        {
            EmbeddedReportService = ServiceManager.GetService<IEmbeddedReportService>("EmbeddedReportService");
        }

        #region 出力
        /// <summary>
        /// 埋込レポートを出力する
        /// </summary>
        /// <returns></returns>
        [Route("output")]
        public EmbeddedReportInfo PostOutputEmbeddedReport(EmbeddedReportQueryParameter param)
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                EmbeddedReportService.DeleteExpiredReports(session);
                info = EmbeddedReportService.OutputEmbeddedReport(session, param.RackId, param.FileName, param.EmbeddedReportFormat, param.AllowOverwriting);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }
        #endregion
        
        #region 履歴
        /// <summary>
        /// 履歴一覧表を取得する
        /// </summary>
        /// <param name="rackId"></param>
        /// <returns></returns>
        [Route("getHistoryResult")]
        public SearchResult GetHistoryResult(string rackId)
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                EmbeddedReportService.DeleteExpiredReports(session);
                info = EmbeddedReportService.GetHistoryResults(session, rackId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.HistoryResult;
        }
        
        /// <summary>
        /// 埋込レポート履歴を削除する
        /// </summary>
        /// <param name="historyNumbers"></param>
        /// <returns></returns>
        [Route("deleteHistories")]
        public RequestResult PostDeleteHistories(IEnumerable<int> historyNumbers)
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = EmbeddedReportService.DeleteHistories(session, historyNumbers);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }
        #endregion

        #region フォーマット
        /// <summary>
        /// フォーマット一覧表を取得する
        /// </summary>
        /// <returns></returns>
        [Route("getFormatResult")]
        public SearchResult GetFormatResult()
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = EmbeddedReportService.GetFormatResult(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.FormatResult;
        }

        /// <summary>
        /// フォーマットを取得する
        /// </summary>
        /// <returns></returns>
        [Route("getFormats")]
        public IEnumerable<EmbeddedReportFormat> GetFormats()
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = EmbeddedReportService.GetFormats(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.EmbeddedReportFormats;
        }

        /// <summary>
        /// フォーマットを登録する
        /// </summary>
        /// <returns></returns>
        [Route("setFormat")]
        public RequestResult PostSetFormat(EmbeddedReportQueryParameter param)
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                var data = Convert.FromBase64String(param.DataString);
                info = EmbeddedReportService.SetFormat(session, param.EmbeddedReportFormat, data, param.AllowOverwriting, param.CheckFormat);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// フォーマットを削除する
        /// </summary>
        /// <param name="embeddedReportFormats"></param>
        /// <returns></returns>
        [Route("deleteFormats")]
        public RequestResult PostDeleteFormats(IEnumerable<EmbeddedReportFormat> embeddedReportFormats)
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = EmbeddedReportService.DeleteFormats(session, embeddedReportFormats);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.RequestResult;
        }
        #endregion

        #region 電気錠ログ帳票関連

        /// <summary>
        /// 電気錠ログ帳票出力
        /// </summary>
        /// <returns></returns>
        [Route("output/eLockOpLog")]
        public EmbeddedReportInfo PostOutputELockOpLogEmbeddedReport(EmbeddedReportOutputQueryParameter param)
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = EmbeddedReportService.OutputELockOpLogEmbeddedReport(session, param.LookUp, param.IsUnlockSearch, param.IsLockSearch, param.Title, param.EmbeddedReportFormat, param.ICCardCondition, param.IsCardOperation);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, true);
            }

            return info;
        }

        /// <summary>
        /// 電気錠ログ帳票フォーマット一覧表取得
        /// </summary>
        /// <returns></returns>
        [Route("getELockOpLogFormatResult")]
        public SearchResult GetELockOpLogFormatResult()
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            SearchResult result = new SearchResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = EmbeddedReportService.GetELockOpLogFormatResult(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info.FormatResult;
        }

        /// <summary>
        /// 電気錠ログ帳票フォーマット一覧取得
        /// </summary>
        /// <returns></returns>
        [Route("getELockOpLogFormats")]
        public IEnumerable<EmbeddedReportFormat> GetELockOpLogFormats()
        {
            IEnumerable<EmbeddedReportFormat> formats = new List<EmbeddedReportFormat>();
            Session session = SessionAccessor.GetSession();

            try
            {
                formats = EmbeddedReportService.GetELockOpLogFormats(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                formats = null;
            }

            return formats;
        }

        /// <summary>
        /// 電気錠ログ帳票フォーマット保存
        /// </summary>
        /// <returns></returns>
        [Route("setELockOpLogFormat")]
        public RequestResult PostSetELockOpLogFormat(EmbeddedReportFormatQueryParameter param)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                var data = Convert.FromBase64String(param.DataString);
                result = EmbeddedReportService.SetELockOpLogFormat(session, param.EmbeddedReportFormat, data, param.AllowOverwriting);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                result = GetErrorRequestResult(session.CultureInfo, false, true);
            }

            return result;
        }

        /// <summary>
        /// 電気錠ログ帳票フォーマット削除
        /// </summary>
        /// <param name="embeddedReportFormats"></param>
        /// <returns></returns>
        [Route("deleteELockOpLogFormats")]
        public RequestResult PostDeleteELockOpLogFormats(IEnumerable<EmbeddedReportFormat> embeddedReportFormats)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = EmbeddedReportService.DeleteELockOpLogFormats(session, embeddedReportFormats);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                result = GetErrorRequestResult(session.CultureInfo, false, false);
            }

            return result;
        }

        #endregion

        #region private

        /// <summary>
        /// エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <param name="isRegister">データ登録かどうか</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetErrorRequestResult(CultureInfo cultureInfo, bool isOutput, bool isRegister = false)
        {
            string messageId = "";

            if (isOutput)
            {
                messageId = "EmbeddedReport_OutputEmbeddedReport_ErrorOutputEmbeddedReport";
            }
            else
            {
                messageId = isRegister ? "EmbeddedReport_SetFormat_ErrorSetFormat" : "EmbeddedReport_DeleteFormat_ErrorDeleteFormat";
            }

            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage(messageId, cultureInfo)
            };
        }

        #endregion
    }
}
