using garmit.Core;
using garmit.DomainObject;
using garmit.Service.Line;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Web.Http;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// 回線サービス用のAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/line")]
    public class LineApiController : ApiController
    {
        /// <summary>
        /// 回線サービス
        /// </summary>
        public ILineService LineService { get; set; }

        public LineApiController()
        {
            LineService = ServiceManager.GetService<ILineService>("LineService");
        }

        /// <summary>
        /// 回線画面の初期情報取得
        /// </summary>
        /// <returns>ControlInfo.LookUp</returns>
        [Route("")]
        public LookUp GetLookUp()
        {
            LookUp lookUp = new LookUp();
            Session session = SessionAccessor.GetSession();

            try
            {
                lookUp = LineService.GetLookUp(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return lookUp;
        }

        /// <summary>
        /// 回線検索
        /// </summary>
        /// <param name="condition">検索条件</param>
        /// <returns>検索結果</returns>
        [Route("getLineResult")]
        public SearchResult PostGetLineResult(PatchCableInfo condition)
        {
            SearchResult result = new SearchResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = LineService.SearchLines(session, condition);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return result;
        }

        /// <summary>
        /// 回線情報取得
        /// </summary>
        /// <param name="patchCable">配線盤ID/線番</param>
        /// <returns>回線情報</returns>
        [Route("getPatchCableForm")]
        public PatchCableForm PostGetPatchCableForm(PatchCableData patchCable)
        {
            PatchCableForm patchCableForm = new PatchCableForm();
            Session session = SessionAccessor.GetSession();
            try
            {
                patchCableForm = LineService.GetPatchCableForm(session, patchCable);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return patchCableForm;
        }

        /// <summary>
        /// 回線保存
        /// </summary>
        /// <param name="patchCableForm">保存する回線情報</param>
        /// <returns>保存結果</returns>
        [Route("setPatchCableForm")]
        public RequestResult PostSetPatchCableForm(PatchCableForm patchCableForm)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();
            try
            {
                result = LineService.SetPatchCable(session, patchCableForm);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetErrorRequestResult(session.CultureInfo);
            }
            return result;
        }

        #region 回線ファイル関係
        
        /// <summary>
        /// 回線ファイル一覧取得
        /// </summary>
        /// <param name="patchCable"></param>
        /// <returns></returns>
        [Route("getPatchCableFileList")]
        public SearchResult PostGetPatchCableFileList(PatchCableData patchCable)
        {
            SearchResult result = new SearchResult();
            Session session = SessionAccessor.GetSession();
            try
            {
                result = LineService.GetPatchCableFileList(session, patchCable);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return result;
        }
        
        /// <summary>
        /// 回線ファイル保存
        /// </summary>
        /// <param name="patchCable"></param>
        /// <returns></returns>
        [Route("uploadPatchCableFile")]
        public RequestResult PostUploadPatchCableFile(LineFileQueryParameter param)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();
            try
            {
                var data = Convert.FromBase64String(param.DataString);
                result = LineService.SetPatchCableFiles(session, param.PatchCableDataList, param.FileName, data, param.Overwrite);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetFileErrorRequestResult(session.CultureInfo, true);
            }
            return result;
        }

        /// <summary>
        /// 回線ファイル削除
        /// </summary>
        /// <param name="patchCable"></param>
        /// <returns></returns>
        [Route("deletePatchCableFiles")]
        public RequestResult PostDeletePatchCableFile(LineFileQueryParameter param)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();
            try
            {
                result = LineService.DeletePatchCableFiles(session, param.PatchCableData, param.FileNos);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return GetFileErrorRequestResult(session.CultureInfo, true);
            }
            return result;
        }

        #endregion

        #region 回線選択画面

        /// <summary>
        /// 未使用の局入線番取得
        /// </summary>
        /// <param name="parameter">配線盤ID/除外しない線番リスト</param>
        /// <returns>未使用の局入線番リスト</returns>
        [Route("getUnusedInPatchCables")]
        public IEnumerable<PatchCable> PostGetUnusedInPatchCables(PatchCableQueryParameter parameter)
        {
            IEnumerable<PatchCable> patchCables = new List<PatchCable>();
            Session session = SessionAccessor.GetSession();
            try
            {
                patchCables = LineService.GetInPatchCables(session, Enumeration.LineStatus_e.NotUse, parameter.PatchboardId, parameter.AllowedUnfixedCables);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return patchCables;
        }

        /// <summary>
        /// 局入のみの局入線番取得
        /// </summary>
        /// <param name="sequences">除外しない線番リスト</param>
        /// <returns>未使用の局入線番リスト</returns>
        [Route("getInOnlyPatchCables")]
        public IEnumerable<PatchCable> PostGetInOnlyInPatchCables(IEnumerable<PatchCableSequence> sequences)
        {
            IEnumerable<PatchCable> patchCables = new List<PatchCable>();
            Session session = SessionAccessor.GetSession();
            try
            {
                patchCables = LineService.GetInPatchCables(session, Enumeration.LineStatus_e.InOnly, null, sequences);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return patchCables;
        }

        /// <summary>
        /// 使用中の局入線番取得
        /// </summary>
        /// <param name="sequences">除外しない線番リスト</param>
        /// <returns>未使用の局入線番リスト</returns>
        [Route("getUsedInPatchCables")]
        public IEnumerable<PatchCable> PostGetUsedInPatchCables(IEnumerable<PatchCableSequence> sequences)
        {
            IEnumerable<PatchCable> patchCables = new List<PatchCable>();
            Session session = SessionAccessor.GetSession();
            try
            {
                patchCables = LineService.GetInPatchCables(session, Enumeration.LineStatus_e.Use, null, sequences);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return patchCables;
        }

        /// <summary>
        /// 未使用の子IDF(PT)線番取得
        /// </summary>
        /// <param name="parameter">配線盤ID/除外しない線番リスト</param>
        /// <returns></returns>
        [Route("getUnusedChildrenPatchCables")]
        public IEnumerable<PatchCable> PostGetUnusedChildrenPatchCables(PatchCableQueryParameter parameter)
        {
            IEnumerable<PatchCable> patchCables = new List<PatchCable>();
            Session session = SessionAccessor.GetSession();
            try
            {
                patchCables = LineService.GetChildrensPatchCables(session, parameter.PatchboardId.Value, Enumeration.LineStatus_e.NotUse, parameter.AllowedUnfixedCables);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return patchCables;
        }

        /// <summary>
        /// 未使用の複数子IDF(PT)線番情報取得
        /// </summary>
        /// <param name="parameter">配線盤ID/除外しない線番のリスト</param>
        /// <returns></returns>
        [Route("getUnusedChildrenPatchCablesList")]
        public IEnumerable<PatchCableConnection> PostGetUnusedPatchCablesList(PatchCableQueryParameter parameter)
        {
            IEnumerable<PatchCableConnection> patchCableConnections = new List<PatchCableConnection>();
            Session session = SessionAccessor.GetSession();
            try
            {
                patchCableConnections = LineService.GetChildrensPatchCableConnections(session, parameter.PatchboardIds, Enumeration.LineStatus_e.NotUse, parameter.AllowedUnfixedCables);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return patchCableConnections;
        }

        /// <summary>
        /// 未使用のIDF(PT)線番取得
        /// </summary>
        /// <param name="sequences">除外しない線番リスト</param>
        /// <returns></returns>
        [Route("getUnusedPatchCables")]
        public IEnumerable<PatchCable> PostGetUnusedPatchCables(IEnumerable<PatchCableSequence> sequences)
        {
            IEnumerable<PatchCable> patchCables = new List<PatchCable>();
            Session session = SessionAccessor.GetSession();
            try
            {
                patchCables = LineService.GetPatchCables(session, null, Enumeration.LineStatus_e.NotUse, sequences);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return patchCables;
        }

        /// <summary>
        /// 構内のみのIDF(PT)線番取得
        /// </summary>
        /// <param name="sequences">除外しない線番リスト</param>
        /// <returns></returns>
        [Route("getPremiseOnlyPatchCables")]
        public IEnumerable<PatchCable> PostGetPremiseOnlyPatchCables(IEnumerable<PatchCableSequence> sequences)
        {
            IEnumerable<PatchCable> patchCables = new List<PatchCable>();
            Session session = SessionAccessor.GetSession();
            try
            {
                patchCables = LineService.GetPatchCables(session, null, Enumeration.LineStatus_e.PremiseOnly, sequences);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return patchCables;
        }

        /// <summary>
        /// 線番接続情報検索 ※使用しない
        /// </summary>
        /// <param name="parameter">配線盤ID/線番/除外しない線番リスト</param>
        /// <returns></returns>
        [Route("getLineConnection")]
        public IEnumerable<LineConnection> PostGetLineConnections(PatchCableQueryParameter parameter)
        {
            IEnumerable<LineConnection> lineConnections = new List<LineConnection>();
            Session session = SessionAccessor.GetSession();
            try
            {
                lineConnections = LineService.GetLineConnections(session, parameter.PatchboardId.Value, parameter.PatchCableNo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return lineConnections;
        }


        /// <summary>
        /// 回線情報検索
        /// </summary>
        /// <param name="parameter">配線盤ID/線番/除外しない線番リスト</param>
        /// <returns></returns>
        [Route("getLine")]
        public Line PostGetLine(PatchCableQueryParameter parameter)
        {
            Line line = new Line();
            Session session = SessionAccessor.GetSession();
            try
            {
                line = LineService.GetLine(session, parameter.PatchboardId.Value, parameter.PatchCableNo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
            return line;
        }

        #endregion

        #region private

        /// <summary>
        /// エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetErrorRequestResult(CultureInfo cultureInfo)
        {
            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage("PatchCable_RegisterError", cultureInfo)
            };
        }


        /// <summary>
        /// エラーリクエスト結果を取得する
        /// </summary>
        /// <param name="cultureInfo">カルチャ情報</param>
        /// <param name="isRegister">データ登録かどうか</param>
        /// <returns>リクエスト結果</returns>
        private RequestResult GetFileErrorRequestResult(CultureInfo cultureInfo, bool isRegister)
        {
            string　messageId = isRegister ? "PatchCableFile_RegisterError" : "PatchCableFile_DeleteError";
            return new RequestResult
            {
                IsSuccess = false,
                Message = MessageUtil.GetMessage(messageId, cultureInfo)
            };
        }

        #endregion

    }
}
