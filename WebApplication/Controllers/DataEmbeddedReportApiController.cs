using garmit.Core;
using garmit.DomainObject;
using garmit.Service.EmbeddedReport;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// データ帳票APIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/dataEmbeddedReport")]
    public class DataEmbeddedReportApiController : ApiController
    {
        /// <summary>
        /// データ帳票サービス
        /// </summary>
        IDataEmbeddedReportService DataEmbeddedReportService { get; set; }

        public DataEmbeddedReportApiController()
        {
            DataEmbeddedReportService = ServiceManager.GetService<IDataEmbeddedReportService>("DataEmbeddedReportService");
        }
        
        /// <summary>
        /// 帳票出力（データ）
        /// </summary>
        /// <returns></returns>
        [Route("output")]
        public EmbeddedReportInfo PostOutputEmbeddedReport(EmbeddedReportOutputQueryParameter param)
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = DataEmbeddedReportService.OutputEmbeddedReport(session, param.LookUp, param.Title, param.EmbeddedReportFormat);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, true);
            }

            return info;
        }
        
        /// <summary>
        /// 帳票フォーマット一覧表を取得する
        /// </summary>
        /// <returns></returns>
        [Route("getFormatResult")]
        public SearchResult GetFormatResult()
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = DataEmbeddedReportService.GetFormatResult(session);;
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.FormatResult;
        }

        /// <summary>
        /// 帳票フォーマット一覧を取得する
        /// </summary>
        /// <returns></returns>
        [Route("getFormats")]
        public IEnumerable<EmbeddedReportFormat> GetFormats()
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = DataEmbeddedReportService.GetFormats(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }

            return info.EmbeddedReportFormats;
        }

        /// <summary>
        /// 帳票フォーマットを登録する
        /// </summary>
        /// <returns></returns>
        [Route("setFormat")]
        public RequestResult PostSetFormat(EmbeddedReportFormatQueryParameter param)
        {
            EmbeddedReportInfo info = new EmbeddedReportInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                var data = Convert.FromBase64String(param.DataString);
                info = DataEmbeddedReportService.SetFormat(session, param.EmbeddedReportFormat, data, param.AllowOverwriting);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, false, true);
            }

            return info.RequestResult;
        }

        /// <summary>
        /// 帳票フォーマットを削除する
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
                info = DataEmbeddedReportService.DeleteFormats(session, embeddedReportFormats);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                info.RequestResult = GetErrorRequestResult(session.CultureInfo, false, false);
            }

            return info.RequestResult;
        }


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
