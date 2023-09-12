using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using garmit.Core;
using garmit.DomainObject;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Service.Patchboard;
using garmit.Web.Models;

namespace garmit.Web.Controllers
{
    [SessionExpireApiFilter]
    [RoutePrefix("api/Patchboard")]
    public class PatchboardApiController : ApiController
    {
        public IPatchboardService PatchboardService { get; set; }

        public PatchboardApiController()
        {
            PatchboardService = ServiceManager.GetService<IPatchboardService>("PatchboardService");
        }

        /// <summary>
        /// 初期表示項目を返却する
        /// </summary>
        /// <returns></returns>
        [Route("lookUp")]
        public LookUp GetLookUp()
        {
            
            LookUp lookUp = new LookUp();
            Session session = SessionAccessor.GetSession();

            try 
            {
                lookUp = PatchboardService.GetLookUp(session);
            } 
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }
            
            return lookUp;
        }

        /// <summary>
        /// 新規配線盤画面情報を返却する
        /// </summary>
        /// <returns></returns>
        [Route("newForm")]
        public PatchboardForm GetNewForm()
        {
            PatchboardForm patchboardForm = new PatchboardForm();
            Session session = SessionAccessor.GetSession();

            try
            {
                patchboardForm = PatchboardService.GetNewPatchboardForm(session);
                patchboardForm.Patchboard.PatchboardId = -1;
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return patchboardForm;
        }

        /// <summary>
        /// 全配線盤情報を返却する
        /// </summary>
        /// <returns></returns>
        [Route("all")]
        [HttpGet]
        public IEnumerable<Patchboard> GetAllPatchboard()
        {
            IEnumerable<Patchboard> patchboards = new List<Patchboard>();
            Session session = SessionAccessor.GetSession();

            try
            {
                patchboards = PatchboardService.GetPatchboards(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return patchboards;
        }

        /// <summary>
        /// 配線盤画面情報を1件返却する
        /// </summary>
        /// <param name="patchboardId"></param>
        /// <returns></returns>
        [Route("form")]
        [HttpPost]
        public PatchboardForm GetPatchboardForm(PatchboardQueryParameter param)
        {
            PatchboardForm patchboardForm = new PatchboardForm();
            Session session = SessionAccessor.GetSession();

            try
            {
                patchboardForm = PatchboardService.GetPatchboardForm(session, param.PatchboardId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return patchboardForm;
        }

        /// <summary>
        /// 配線盤情報を1件返却する
        /// </summary>
        /// <param name="patchboardId"></param>
        /// <returns></returns>
        [Route("")]
        [HttpPost]
        public Patchboard GetPatchboard(PatchboardQueryParameter param)
        {
            Patchboard patchboard = new Patchboard();
            Session session = SessionAccessor.GetSession();

            try
            {
                patchboard = PatchboardService.GetPatchboard(session, param.PatchboardId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return patchboard;
        }

        /// <summary>
        /// 該当配線盤の先祖ツリーを返却する
        /// </summary>
        /// <param name="patchboardId"></param>
        /// <returns></returns>
        [Route("tree/ancestors")]
        [HttpPost]
        public IEnumerable<PatchboardTree> GetAncestorsTree(PatchboardQueryParameter param)
        {
            IEnumerable<PatchboardTree> trees = new List<PatchboardTree>();
            Session session = SessionAccessor.GetSession();

            try
            {
                trees = PatchboardService.GetAncestorTree(session, param.PatchboardId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return trees;
        }

        /// <summary>
        /// 該当配線盤から親方向の経路ツリーを返却する
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        [Route("tree/fromOwn")]
        [HttpPost]
        public IEnumerable<PatchboardTree> GetPathTrees(PatchboardQueryParameter param)
        {
            IEnumerable<PatchboardTree> trees = new List<PatchboardTree>();
            Session session = SessionAccessor.GetSession();

            try
            {
                trees = PatchboardService.GetPathTrees(session, param.PatchboardId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return trees;
        }

        /// <summary>
        /// 該当配線盤の子一覧を返却する
        /// </summary>
        /// <returns></returns>
        [Route("children")]
        [HttpPost]
        public IEnumerable<Patchboard> GetChildren(PatchboardQueryParameter param)
        {
            IEnumerable<Patchboard> children = new List<Patchboard>();
            Session session = SessionAccessor.GetSession();

            try
            {
                children = PatchboardService.GetChildrenPatchboards(session, param.PatchboardId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return children;
        }

        /// <summary>
        /// 該当配線盤＋経路番号の子一覧を返却する
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        [Route("children/pathNo")]
        [HttpPost]
        public IEnumerable<Patchboard> GetChildrenByPathNo(PatchboardQueryParameter param)
        {
            IEnumerable<Patchboard> children = new List<Patchboard>();
            Session session = SessionAccessor.GetSession();

            try
            {
                children = PatchboardService.GetChildrenPatchboards(session, param.PatchboardId, param.PathNo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return children;
        }

        /// <summary>
        /// 親配線盤がクリア可能かチェック
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        [Route("check/parentDelete")]
        [HttpPost]
        public RequestResult CheckParentDeleteEnable(PatchboardQueryParameter param)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = PatchboardService.CheckParentDeleteEnable(session, param.PatchboardId, param.PathNo);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }

        /// <summary>
        /// 配線盤検索
        /// </summary>
        /// <param name="info"></param>
        /// <returns></returns>
        [Route("search")]
        [HttpPost]
        public SearchResult SearchPatchboards(PatchboardInfo info)
        {
            try
            {
                Session session = SessionAccessor.GetSession();
                var searchResult = PatchboardService.SearchPatchboards(session, info.LookUp, info.PatchboardNames);
                return searchResult;
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex);
                return null;
            }
        }

        /// <summary>
        /// 配線盤情報一覧を返却する
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        [Route("bulkGet")]
        [HttpPost]
        public IEnumerable<Patchboard> GetPatchboards(PatchboardQueryParameter param)
        {
            IEnumerable<Patchboard> patchboards = new List<Patchboard>();
            Session session = SessionAccessor.GetSession();

            try
            {
                patchboards = PatchboardService.GetPatchboards(session, param.PatchboardIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return patchboards;
        }

        /// <summary>
        /// 配線盤情報を1件保存する
        /// </summary>
        /// <param name="patchboardForm"></param>
        /// <returns></returns>
        [Route("set")]
        [HttpPost]
        public RequestResult SetPatchboard(PatchboardForm patchboardForm)
        {
            try
            {
                Session session = SessionAccessor.GetSession();
                var result = PatchboardService.SetPatchboard(session, patchboardForm);
                return result;
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex);
                return new RequestResult
                {
                    IsSuccess = false,
                    Message = "保存に失敗しました。"
                };
            }
        }

        /// <summary>
        /// 配線盤を一括保存する
        /// </summary>
        /// <param name="patchboards"></param>
        /// <returns></returns>
        [Route("bulkSet")]
        [HttpPost]
        public RequestResult SetPatchboards(IEnumerable<Patchboard> patchboards)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();
            
            try
            {
                result = PatchboardService.SetPatchboards(session, patchboards);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }

        /// <summary>
        /// 配線盤を一括削除する
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        [Route("bulkDelete")]
        [HttpPost]
        public RequestResult DeletePatchboards(PatchboardQueryParameter param)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = PatchboardService.DeletePatchboards(session, param.PatchboardIds);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }

        /// <summary>
        /// 配線盤を1件削除する
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        [Route("delete")]
        [HttpPost]
        public RequestResult DeletePatchboard(PatchboardQueryParameter param)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = PatchboardService.DeletePatchboard(session, param.PatchboardId);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }

        /// <summary>
        /// 配線盤系統表示画面情報を返却する
        /// </summary>
        /// <param name="param"></param>
        /// <returns></returns>
        [Route("group")]
        [HttpPost]
        public PatchboardGroupInfo GetPatchboardGroupInfo(PatchboardQueryParameter param)
        {
            Session session = SessionAccessor.GetSession();

            try
            {
                //配線盤画面情報
                var patchboardForm = PatchboardService.GetPatchboardForm(session, param.PatchboardId);

                //該当配線盤の先祖ツリー
                var trees = PatchboardService.GetAncestorTree(session, param.PatchboardId);

                //先頭のツリーの末端を取得
                var leafs = GetLeafPatchboards(new List<PatchboardTree> { trees.First() });
                var leaf = leafs.First();

                var children = PatchboardService.GetChildrenPatchboards(session, leaf.PatchboardId, leaf.PathNo);

                return new PatchboardGroupInfo
                {
                    PatchboardForm = patchboardForm,
                    AncestorTrees = trees,
                    ChildrenPatchboards = children,
                };
            }
            catch(Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
                return null;
            }
        }

        /// <summary>
        /// 配線盤表示順情報を取得する
        /// </summary>
        /// <returns></returns>
        [Route("order/getInfo")]
        [HttpGet]
        public PatchboardOrderInfo GetPatchboardOrderInfo()
        {
            PatchboardOrderInfo info = new PatchboardOrderInfo();
            Session session = SessionAccessor.GetSession();

            try
            {
                info = PatchboardService.GetPatchboardOrderInfo(session);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return info;
        }

        /// <summary>
        /// 配線盤表示順を保存する
        /// </summary>
        /// <param name="patchboardOrders"></param>
        /// <returns></returns>
        [Route("order/set")]
        [HttpPost]
        public RequestResult SetPatchboardOrders(PatchboardOrderQueryParameter parameter)
        {
            RequestResult result = new RequestResult();
            Session session = SessionAccessor.GetSession();

            try
            {
                result = PatchboardService.SetPatchboardOrders(session, parameter.PatchboardOrders, parameter.IsInpatchboard);
            }
            catch (Exception ex)
            {
                Logger.Instance.LogException(ex, Logger.LogLevel.Error);
            }

            return result;
        }

        /// <summary>
        /// ツリー内の葉を返却する
        /// </summary>
        /// <param name="trees"></param>
        /// <returns></returns>
        private IEnumerable<PatchboardTree> GetLeafPatchboards(IEnumerable<PatchboardTree> trees)
        {
            var leafs = new List<PatchboardTree>();

            foreach (var tree in trees)
            {
                if (tree.Children != null && tree.Children.Any())
                {
                    var tempLeafs = GetLeafPatchboards(tree.Children);
                    leafs.AddRange(tempLeafs);
                }
                else
                {
                    leafs.Add(tree);
                }
            }

            return leafs;
        }
    }
}