/*--------------------------------------------------------------------------------------------------
ステートが永久持続するプラグイン

■概要
指定したステートを永久に持続させることができます。
通常のステートはターン数で消滅しますが、このプラグインを使用することで
特定のステートを永続化できます。

■使用方法
1. ステートのカスタムパラメータに以下を設定：
   permanent: true

2. または、プラグインパラメータで指定したステートIDを永続化

■設定項目
- 永続化するステートID: カンマ区切りで複数指定可能
- デバッグモード: ログ出力の有無

■作成者
AI Assistant

■対応バージョン
SRPG Studio Version:1.111

■更新履歴
2024/12/19	作成

--------------------------------------------------------------------------------------------------*/

(function() {
    'use strict';

    // プラグインパラメータ（SRPG Studio用）
    var permanentStateIds = [11, 12, 13, 14]; // デフォルト値
    var debugMode = false; // デフォルト値
    
    // プラグインパラメータが利用可能な場合のみ取得
    if (typeof PluginManager !== 'undefined' && PluginManager.parameters) {
        try {
            var parameters = PluginManager.parameters('ステート永久持続');
            if (parameters && parameters['永続化するステートID']) {
                permanentStateIds = parameters['永続化するステートID'].split(',').map(function(id) {
                    return parseInt(id.trim()) || 0;
                }).filter(function(id) { return id > 0; });
            }
            if (parameters && parameters['デバッグモード']) {
                debugMode = parameters['デバッグモード'] === 'true';
            }
        } catch (e) {
            console.log('[ステート永久持続] プラグインパラメータの取得に失敗しました。デフォルト値を使用します。');
        }
    }

    // デバッグログ出力関数
    function debugLog(message) {
        if (debugMode) {
            console.log('[ステート永久持続] ' + message);
        }
    }

    // ステートが永続化対象かチェック
    function isPermanentState(stateOrId) {
        var stateId;
        var state;
        
        // stateオブジェクトまたはstateIdを受け取る
        if (typeof stateOrId === 'object' && stateOrId !== null) {
            // stateオブジェクトが渡された場合
            state = stateOrId;
            stateId = state.getId();
        } else {
            // stateIdが渡された場合
            stateId = stateOrId;
        }
        
        // プラグインパラメータで指定されたIDをチェック
        if (permanentStateIds.indexOf(stateId) !== -1) {
            return true;
        }
        
        // ステートのカスタムパラメータをチェック
        if (state) {
            // stateオブジェクトが既にある場合はそれを使用
            if (state.custom && state.custom.permanent === 'true') {
                return true;
            }
        } else {
            // stateオブジェクトがない場合は取得を試みる
            try {
                var list = root.getBaseData().getStateList();
                if (list) {
                    state = list.getDataFromId(stateId);
                    if (state && state.custom && state.custom.permanent === 'true') {
                        return true;
                    }
                }
            } catch (e) {
                debugLog('ステート取得エラー: ' + e.message);
            }
        }
        
        return false;
    }

    // 元の関数を保存
    var _StateControl_arrangeState = StateControl.arrangeState;
    var _StateControl_decreaseTurn = StateControl.decreaseTurn;

    // StateControl.arrangeState をオーバーライド
    StateControl.arrangeState = function(unit, state, increaseType) {
        // stateがnullの場合は通常処理を実行
        if (!state) {
            return _StateControl_arrangeState.call(this, unit, state, increaseType);
        }
        
        // 永続ステートかチェック（stateオブジェクトを直接渡す）
        if (isPermanentState(state)) {
            if (increaseType === IncreaseType.DECREASE) {
                debugLog('永続ステート ' + state.getId() + ' の削除を試行しましたが、永続化により無効化されました');
                return null; // 永続ステートは削除しない
            }
            else if (increaseType === IncreaseType.INCREASE) {
                debugLog('永続ステート ' + state.getId() + ' を追加しました');
                var result = _StateControl_arrangeState.call(this, unit, state, increaseType);
                if (result) {
                    // 永続ステートの場合は持続時間を0に設定
                    result.setTurn(0);
                }
                return result;
            }
        }
        return _StateControl_arrangeState.call(this, unit, state, increaseType);
    };

    // StateControl.decreaseTurn をオーバーライド
    StateControl.decreaseTurn = function(unitList) {
        var i, j, unit, list, count, turnState, state;
        
        for (i = 0; i < unitList.getCount(); i++) {
            unit = unitList.getData(i);
            list = unit.getTurnStateList();
            count = list.getCount();
            
            for (j = 0; j < count; j++) {
                turnState = list.getData(j);
                state = turnState.getState();
                
                // stateがnullの場合はスキップ
                if (!state) {
                    continue;
                }
                
                // 永続ステートかチェック（stateオブジェクトを直接渡す）
                if (isPermanentState(state)) {
                    // 永続ステートの場合は持続時間をリセット
                    turnState.setTurn(0);
                    debugLog('永続ステート ' + state.getId() + ' の持続時間をリセットしました');
                }
                else {
                    // 通常のステートは通常通りターン数を減少
                    turnState.setTurn(turnState.getTurn() - 1);
                }
            }
        }
    };

    debugLog('ステート永久持続プラグインが読み込まれました');
    debugLog('永続化対象ステートID: ' + permanentStateIds.join(', '));

})();
