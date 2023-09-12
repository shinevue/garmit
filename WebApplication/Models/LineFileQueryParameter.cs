using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    public class LineFileQueryParameter
    {
        /// <summary>
        /// 線番リスト（PatchboardId/CableNoのみ使用）
        /// </summary>
        public IEnumerable<PatchCableData> PatchCableDataList { get; set; }

        /// <summary>
        /// ファイル名
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// ファイルデータ文字列
        /// </summary>
        public string DataString { get; set; }

        /// <summary>
        /// 上書きするかどうか
        /// </summary>
        public bool Overwrite { get; set; }


        /// <summary>
        /// 線番情報（PatchboardId/CableNoのみ使用）※単体
        /// </summary>
        public PatchCableData PatchCableData { get; set; }

        /// <summary>
        /// ファイル番号リスト
        /// </summary>
        public IEnumerable<int> FileNos { get; set; }
    }
}